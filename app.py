# app.py
from flask import Flask,render_template

app = Flask(__name__)

@app.route('/home')
@app.route('/')
def home():
    return render_template('index.html')



@app.route('/about')
def about():
    return '<H1>about page</H1>'

if __name__ == '__main__':
    app.run(debug=True)
