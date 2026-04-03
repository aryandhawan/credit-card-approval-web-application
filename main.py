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
