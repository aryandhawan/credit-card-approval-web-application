# credit-card-approval-web-application
A full-stack machine learning project that predicts credit card approvals using user-friendly forms and modern ML pipelines. This repository includes data processing, robust model selection, and an interactive web app interface for real-time predictions.

## Overview
This project demonstrates the entire workflow for building, evaluating, and deploying a credit card approval prediction system:

Data Preprocessing: Handles both numerical and categorical features with scalable pipelines.

Model Selection: Compares multiple algorithms and identifies Random Forest as the best performer.

Deployment: Serves predictions through a Flask backend with a polished HTML/CSS/JS front-end.

User Interface: Lets users input their details through an intuitive web form and receive instant feedback.

## Features
End-to-end ML workflow: Data cleaning, preprocessing, model training, evaluation, and deployment.

Powerful Random Forest model, selected through rigorous cross-validation.

Feature scaling, encoding, and order are automatically preserved with scikit-learn Pipelines.

Intuitive, mobile-friendly web form for inputting credit card application details.

Backend-frontend separation: Scalable, maintainable, and easy to deploy.

## How It Works
Data Preparation
Raw application data is cleaned and separated into numerical and categorical columns.

## Model Training
Four classifiers are tested; Random Forest is chosen based on accuracy, precision, recall, and F1-score.

## Model Deployment
The best-performing pipeline is saved via joblib and loaded by a Flask backend.

## Web Interface
Users submit their application details; the backend preprocesses inputs, makes a prediction, and returns the result instantly.

## Results

Random Forest Accuracy: Typically 85–86% (cross-validated)

Web app: Instant user response, readable output ("Approved" or "Not Approved")

Frontend: Accessible, visually appealing, and fully responsive

Next Steps
Add Docker support or cloud deployment options.

Integrate a database for logging and analytics.

Expand user feedback/interpretability (e.g., feature importance display).

Polish the frontend further or add authentication.
