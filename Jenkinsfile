pipeline {
    agent any

    environment {
        APP_NAME = "ubnd-fe-dan"
        ENVIRONMENT_NAME = "deploy"
        ENV_CRED_ID = "ubnd-fe-dan"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {

        stage('Initialize') {
            steps {
                script {
                    def BR = (env.BRANCH_NAME ?: "deploy")

                    if (BR != "deploy") {
                        error("Only deploy branch allowed!")
                    }

                    env.IMAGE_TAG = "${env.APP_NAME}:${env.ENVIRONMENT_NAME}-${env.BUILD_NUMBER}"
                }
            }
        }

        stage('Checkout') {
            steps { 
                checkout scm 
            }
        }

        stage('Build') {
            steps {
                withCredentials([file(credentialsId: env.ENV_CRED_ID, variable: 'ENV_FILE')]) {
                    sh '''
                        echo "--- Load .env --------------------"
                        set -a
                        . "$ENV_FILE"
                        set +a

                        echo "--- Generating build args for Docker"
                        BUILD_ARGS=""
                        
                        # Loop through all VITE_ variables
                        for VAR in $(env | grep '^VITE_' | cut -d= -f1); do
                            VAR_VALUE=$(eval echo \\$${VAR})
                            BUILD_ARGS="${BUILD_ARGS} --build-arg ${VAR}=${VAR_VALUE}"
                        done

                        echo "Build args: ${BUILD_ARGS}"

                        DOCKER_BUILDKIT=1 docker build --pull \
                            ${BUILD_ARGS} \
                            -t ${IMAGE_TAG} .
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    APP_NAME_UNIQUE="${APP_NAME}-${ENVIRONMENT_NAME}"

                    docker stop ${APP_NAME_UNIQUE} || true
                    docker rm ${APP_NAME_UNIQUE} || true

                    docker run -d \
                        --name ${APP_NAME_UNIQUE} \
                        --restart unless-stopped \
                        --network npm-network \
                        ${IMAGE_TAG}
                '''
            }
        }

        stage('Cleanup') {
            steps {
                sh '''
                    OLD_IMAGES=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep "${APP_NAME}" | grep -v "${IMAGE_TAG}" || true)
                    for IMG in $OLD_IMAGES; do
                        docker rmi -f $IMG || true
                    done
                '''
            }
        }
    }

    post {
        always {
            echo "Pipeline done."
        }
    }
}