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
                    def BR = (env.BRANCH_NAME ?: 'deploy')
                    
                    echo "[Init] Detected branch: ${BR}"
                    
                    if (BR != 'deploy') {
                        error("This pipeline only supports 'deploy' branch. Current branch: ${BR}")
                    }

                    env.IMAGE_TAG = "${env.APP_NAME}:${env.ENVIRONMENT_NAME}-${env.BUILD_NUMBER}"

                    echo "[Init] ENVIRONMENT_NAME = ${env.ENVIRONMENT_NAME}"
                    echo "[Init] IMAGE_TAG        = ${env.IMAGE_TAG}"
                    echo "[Init] ENV_CRED_ID      = ${env.ENV_CRED_ID}"
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
                echo "[${env.ENVIRONMENT_NAME}] Code checked out from deploy branch."
            }
        }

        stage('Build') {
            steps {
                echo "[${env.ENVIRONMENT_NAME}] Building Docker image for React app…"

                withCredentials([file(credentialsId: env.ENV_CRED_ID, variable: 'ENV_FILE')]) {
                    sh """
                        echo "--- Loading environment variables"
                        export \$(cat "\$ENV_FILE" | xargs)
                        
                        echo "--- Building Docker image with build arguments"
                        DOCKER_BUILDKIT=1 docker build --pull \
                            --build-arg VITE_API_BASE_URL=\${VITE_API_BASE_URL} \
                            -t ${env.IMAGE_TAG} .
                    """
                }

                echo "[Build] Completed → ${env.IMAGE_TAG}"
            }
        }

        stage('Test & Scan') {
            steps {
                echo "[${env.ENVIRONMENT_NAME}] Optional: Unit test, Sonar, Trivy scan…"
                // Uncomment below if you want to add security scanning
                // sh """
                //     trivy image --severity HIGH,CRITICAL ${env.IMAGE_TAG}
                // """
            }
        }

        stage('Deploy') { 
            steps {
                sh """
                    APP_NAME_UNIQUE="${APP_NAME}-${ENVIRONMENT_NAME}"

                    echo "--- Stopping old container"
                    docker stop \${APP_NAME_UNIQUE} || true

                    echo "--- Removing old container"
                    docker rm \${APP_NAME_UNIQUE} || true

                    echo "--- Starting new container"
                    docker run -d \
                        --name \${APP_NAME_UNIQUE} \
                        --restart unless-stopped \
                        --network npm-network \
                        ${IMAGE_TAG}

                    echo "--- Deploy OK"
                    echo "--- Container name for NPM: \${APP_NAME_UNIQUE}"
                    echo "--- Internal port: 80"
                """
            }
        }

        stage('Cleanup') {
            steps {
                sh """
                    echo "--- Cleaning old images (keep latest 3 builds)"
                    OLD_IMAGES=\$(docker images --format "{{.Repository}}:{{.Tag}}" | grep "${APP_NAME}" | grep -v "${IMAGE_TAG}" | tail -n +4 || true)

                    for IMG in \$OLD_IMAGES; do
                        echo "Deleting: \$IMG"
                        docker rmi -f \$IMG || true
                    done

                    docker image prune -f || true
                    
                    echo "--- Cleanup completed"
                """
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully for ${env.APP_NAME} on branch ${env.BRANCH_NAME}."
        }
        failure {
            echo "Pipeline failed for ${env.APP_NAME} on branch ${env.BRANCH_NAME}."
        }
        always {
            echo "Pipeline finished at ${new Date()}."
        }
    }
}
