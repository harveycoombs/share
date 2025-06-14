<p align="center"><img src="https://share.surf/images/icon.png" width="120" /></p>

# Share &middot; [share.surf](https://share.surf/)

Share is an easy-to-use file sharing service.

## Purpose
Share exists to provide short-term file sharing, with a clutter-free experience. Although new features are introduced on a regular basis, Share continues to be fast and easy to use.

## Setup
If you wish to run Share yourself, follow the instructions below.

### 1. Create a .env file in the root of the repository
Follow the structure provided below, with your own credentials.
```
DATABASE_HOST=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_SCHEMA=
JWT_SECRET=
MAILERSEND_API_KEY=
```

### 2. Install Dependencies
Run one of the following commands in the terminal to install all necessary dependencies:
<br/>
```npm i``` or ```npm install```

### 3. Run Share
To run Share in development mode, run the following command:
<br/>
```npm run dev```

To build and deploy Share, run the following commands (in order):
<br/>
```npm run build``` and ```npm run start```

> Note: By default, Share in development mode is accessible via port 3000, while Share when deployed is accessible via port 82.

Thank you for using Share! - [Harvey Coombs](https://harveycoombs.com/)
