import pandas as pd
import joblib

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

numerical_pipeline = Pipeline([('scaler', StandardScaler())])

categorical_pipeline = Pipeline([('onehot', OneHotEncoder())])

preprocessing_pipeline = ColumnTransformer([('num', numerical_pipeline, numerical_cols),
                                            ('cat', categorical_pipeline, categorical_cols)])

# models and their pipelines

from sklearn.ensemble import RandomForestClassifier

forest_pipeline = Pipeline([('preprocessor', preprocessing_pipeline)
                               , ('forest_model', RandomForestClassifier(random_state=42))])

# from all of this we get to know that the model that works best with this dataset is random forest
trained_pipeline = forest_pipeline.fit(x_train, y_train)
joblib.dump(trained_pipeline, 'credit_card_pipeline.joblib')

from flask import Flask, render_template, request
import joblib
import pandas as pd

app = Flask(__name__)

# Load your trained pipeline (which includes preprocessing)
model = joblib.load('credit_card_pipeline.joblib')

numerical_cols = ['Gender', 'Age', 'Married', 'BankCustomer', 'YearsEmployed', 'PriorDefault',
                  'Employed', 'CreditScore', 'DriversLicense', 'ZipCode', 'Income']
categorical_cols = ['Industry', 'Ethnicity', 'Citizen']
all_cols = numerical_cols + categorical_cols


@app.route('/', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        # Collect data from form: numerical converted to int/float, categorical as string
        input_data = {
            'Gender': int(request.form['Gender']),
            'Age': int(request.form['Age']),
            'Married': int(request.form['Married']),
            'BankCustomer': int(request.form['BankCustomer']),
            'YearsEmployed': float(request.form['YearsEmployed']),
            'PriorDefault': int(request.form['PriorDefault']),
            'Employed': int(request.form['Employed']),
            'CreditScore': int(request.form['CreditScore']),
            'DriversLicense': int(request.form['DriversLicense']),
            'ZipCode': int(request.form['ZipCode']),  # Keep ZipCode as string if your pipeline treats it as categorical
            'Income': float(request.form['Income']),
            'Industry': request.form['Industry'],
            'Ethnicity': request.form['Ethnicity'],
            'Citizen': request.form['Citizen']
        }

        # Convert dictionary to DataFrame (1 row)
        df_input = pd.DataFrame([input_data], columns=all_cols)

        # Predict
        pred = model.predict(df_input)[0]

        result = "Approved" if pred == 1 else "Not Approved"

        return render_template('index.html', prediction=result)

    # On GET just render page without prediction
    return render_template('index.html', prediction=None)


if __name__ == '__main__':
    app.run(debug=True)
