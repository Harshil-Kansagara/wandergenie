import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = {
  "type": "service_account",
  "project_id": "wandergenie-93c45",
  "private_key_id": "6cf4d4ede7f2716b7b5c193410782fc12e3a64a0",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDN0cbr49w6aVXn\nKKAn9v4ParX/dCC6VoUckcnzlQR9dyDCnqhoxI1lRj82NoBBBgAajq4YktodLoeL\ndwugGJgiVEQgE2CLnjj38eQeZrLNWEP790G3+XDz95+qY/WWa52oac7XUNABPC2o\nJNRGOuAaV8lOjFn+388J4p7khIALY40pfF+JwOIu5q8SsTsHwT9gfXDIdC+E6Ezi\nZ1MlJXMS8KXbLzOQ5uudRWLdoOLF+78GqfV40nXjK/B/uuh3Nq6flsMRu2ECegaz\nBnawx5gKG0vRBMmG6ISy9sRFNLxNDZNY7tH4ImTMC6M8X2sYVPkOx8SItCqHTCFL\nKJWswCd7AgMBAAECggEAANZkWNFfNAhPBoHDz7sm4tPW/xMZ5FLgd8f1amhQ0bHf\nuur/rxgdpdaDVf/NcHZLHyXgJM7JfxTmuEqOYY24EMEHBe+46i3aotJOe1EvqRDo\nNejrpjP9oasq8HviTpphfy3vCYaVUhah7kKNb+Ziww4DDlluhFBPfLAktV6p/AyJ\nxv8iQNQRHOBIb20bZHuQuwJxLtJFKPJBmFr+UuEQnCrTv8Y+b+fjP/JeqXziAJWZ\nuVva8qCRtjyrZRQC2b1Pm2BTJSKPnzTILoxhwPjIQB7Yx4JvO4wSu2Pu45tD1Ghg\ngTcM7CkDOw08jSk0m2Qyb4nEF2VJZmzS5R6ZtPcsAQKBgQD3Ei5YltkbiPrl6NVu\nTyIDY2tq8RHWT3bFCRw3SuogHk+l3s6/TQXCK12OCFbKEeBAhwZBxp9SqGxsLLG9\n3GCwiPX1Vr27rIihGivstCxz8gQFRR3vWg3naWgruQ+2j44XEabcvP8KDvj1689q\nEVqqp58ybNAXa2NCDxDAShLfCwKBgQDVQfM6L2XplTibXNunWucHmL6jWTByR+yH\n5s7v0JQiaaYzP5VfAF4h7ILEVHJEGFQodSnOwL5VA/tj7TTBPoVXB1VsVDujo6Kf\n1whUNQ0q6FFKrzdreQpYrq2wB4RInUywgpaLv64t4Hbl5KLJagvAk8PObwxFTkE0\naLzM15ffUQKBgGDhTi8Kp4M2iTtRuy8P9IRjnaFHefkRG79TPS8pPvjtKcoeve8h\nYpqqqnqhJncB328uAvQT0DF3PVyFggSyv285pUhYhPlsQ/735jVgyPWF9rGiUoSi\nSUVufZx3aoPpcov1LfrsWQ02pcS4fJJYz7aPF8uMA2TLhRZIFgdwhEnVAoGADFN/\nh4Ft1o51cyVu3MF4UQwXGMHy9ugJV+GTXHEl3sdUf+nQ7GjNCBDvjgGDiUQOuTfs\nbrLdTXSpdyEix3ihpGIcIeLMf6zZnXuEU7mtRSmgaTyva1rXqkCOcXo9vyS4Zgtm\nQDWYD7bFqIwKjLHAdCUWUDxC7U6Unj7fisd7U8ECgYEA1PJsk0sp2OBS8m+1rnEm\n2IMyvBx5ekmiS1NOBZqEO7ebACDoMgf3oaX4wxllMCm5HNEABR8Av1ea+SULvUlw\n2V4uuGaSpWp/NRacrCEjyfc2qVfhZepfMBMfKn48H6/XjRew/fhUKbDFjk74ufHC\nLj2fiUpKdIH2rXK4f/XTMnQ=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@wandergenie-93c45.iam.gserviceaccount.com",
  "client_id": "115900121780818863436",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40wandergenie-93c45.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

initializeApp({ 
  credential: cert(serviceAccount) 
});

export const db = getFirestore();