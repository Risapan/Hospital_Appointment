// Declarative pipeline for the local Jenkins (http://localhost:8080).
// Needs: JDK 21 + Maven + Node on the agent, and MongoDB on localhost:27017 for the integration tests.
pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        JAVA_HOME = '/opt/homebrew/opt/openjdk@21'
        PATH = "/opt/homebrew/opt/openjdk@21/bin:/opt/homebrew/bin:${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Backend: test + coverage') {
            steps {
                dir('backend') {
                    sh 'mvn -B clean verify'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true,
                          testResults: 'backend/target/surefire-reports/*.xml, backend/target/cucumber-junit.xml'
                    archiveArtifacts allowEmptyArchive: true,
                          artifacts: 'backend/target/site/jacoco/**, backend/target/cucumber-report.html'
                }
            }
        }

        stage('Frontend: build') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('SonarQube') {
            when { expression { return env.SONAR_TOKEN?.trim() } }
            steps {
                dir('backend') {
                    sh 'mvn -B sonar:sonar -Dsonar.host.url=${SONAR_HOST_URL:-http://localhost:9000} -Dsonar.token=$SONAR_TOKEN'
                }
            }
        }
    }

    post {
        success { echo 'All tests passed.' }
        failure { echo 'Pipeline failed - see the test report above.' }
    }
}
