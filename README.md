# AppDev-Integrative
 
Libraries Installed:
pip install pillow - para sa images
react libraries

# Organized Directories

1. backend folder - Naa diri tanan para sa database, functions, ug uban pa nga django
    a. auth_app folder - naa diri and functionalities para sa user authentication, user database
    b. library_app folder - naa diri and tanan functionalities sa books

2. frontend-website - Naa diri tanan mga react nga fetching, sending sa data
    a. auth folder - naa diri and sign up and login
    b. admin folder - naa diri ang tanan UI/UX sa admin na section
    c. user folder - naa diri ang tanan UI/UX sa user section

# How to run

1. Run the server first
    a. open the terminal in the root or (AppDev-Integrative) directory  
        bash: c: ../../../AppDev-Integrative/ cd backend 
        bash: c: ../../../AppDev-Integrative/backend/ python manage.py runserver
    (Timaan nga ni run)

        System check identified no issues (0 silenced).
        "April 16, 2025 - 08:29:19
        Django version 5.2, using settings 'backend.settings'
        Starting development server at http://127.0.0.1:8000/
        Quit the server with CTRL-BREAK.
        WARNING: This is a development server. Do not use it in a production setting. Use a production WSGI or ASGI server instead.
        For more information on production servers see: https://docs.djangoproject.com/en/5.2/howto/deployment/"

   b. If you want to check the admin administrator of django
       go to http://127.0.0.1:8000/admin (ang 127.0.0.1 is depende kung unsa imong IP address)
       ang admin current is
         (username: adminUser)
         (password: admin@2002)
       
2. Run the frontend
   a. open new terminal in the root or (AppDev-Integrative) directory 
      bash: c: ../../../AppDev-Integrative/ cd frontend-website 
      bash: c: ../../../AppDev-Integrative/frontend-website/ npm run dev
   (Timaan nga ni run)

        > frontend-website@0.0.0 dev
        > vite

        VITE v6.2.5  ready in 247 ms
        ➜  Local:   http://localhost:5173/
        ➜  Network: use --host to expose
        ➜  press h + enter to show help

  (WARNING!!!!)
   possible nga maka adto ka sa  http://localhost:5173/
   sumpayi lang dayun ug login

   ex. http://localhost:5173/login
   
   
