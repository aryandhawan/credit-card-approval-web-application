import pandas as pd
import joblib
import mlflow 
data = pd.read_csv('clean_dataset.csv')
df = pd.DataFrame(data=data)

numerical_cols = ['Gender', 'Age', 'Married', 'BankCustomer', 'YearsEmployed', 'PriorDefault', 'Employed',
                  'CreditScore', 'DriversLicense', 'ZipCode', 'Income']
categorical_cols = ['Industry', 'Ethnicity', 'Citizen']

from sklearn.model_selection import train_test_split

x = df.drop('Approved', axis=1)
y = df['Approved']
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

# now it's time for preprocessing
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
import dagshub


dagshub.init(repo_owner='aryandhawan', repo_name='credit-card-approval-web-application', mlflow=True)
mlflow.set_tracking_uri("https://dagshub.com/aryandhawan/credit-card-approval-web-application.mlflow")
mlflow.set_experiment("credit_card_approval_experiment")


numerical_pipeline = Pipeline([('scaler', StandardScaler())])

categorical_pipeline = Pipeline([('onehot', OneHotEncoder())])

preprocessing_pipeline = ColumnTransformer([('num', numerical_pipeline, numerical_cols),
                                            ('cat', categorical_pipeline, categorical_cols)])


mlflow.sklearn.autolog()
# models and their pipelines

from sklearn.ensemble import RandomForestClassifier

forest_pipeline = Pipeline([('preprocessor', preprocessing_pipeline)
                               , ('forest_model', RandomForestClassifier(random_state=42))])

# from all of this we get to know that the model that works best with this dataset is random forest

with mlflow.start_run(run_name="Random Forest Pipeline"):
    trained_pipeline = forest_pipeline.fit(x_train, y_train)
    joblib.dump(trained_pipeline, 'credit_card_pipeline.joblib')

    mlflow.sklearn.log_model(trained_pipeline, "credit_card_pipeline", registered_model_name="credit_card_pipeline",signature=mlflow.models.infer_signature(x_train, trained_pipeline.predict(x_train)))
