# Backend

You can use virtual env to create a space in which the backend can run without clashing with any other python packages and issues on your local account.

On your own computer /usr/bin/python3 might need to be replaced by another path, e.g. /usr/local/bin/python3

And you will need python 3.6 or 3.7 on your own computer - python 3.5 or earlier will not work.

```bash
cd backend
# create a sandbox for the backend
virtualenv -p /usr/bin/python3 env
# enter sandbox
source env/bin/activate
# set up sandbox
pip install -r requirements.txt
# run backend! Will run on port 5000.
# go to http://127.0.0.1:5000/ to see the docs!
python run.py
```

Once you are done working on the assignment run the following
command to exit the sandbox

```bash
deactivate
```
