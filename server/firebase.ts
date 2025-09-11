import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = {
  type: "service_account",
  project_id: "wandergenie-93c45",
  private_key_id: "3bd99c73c588f1f76e81a2fc09ebdb42a78d3bdb",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCidO0OwS7jmz43\n0hM0yffvQzz25opShx334oKMeveMLhqP4x/BO9Pd6nNdMqW4l0989QPM5BY54KwB\nMmyJT13M490QgbMR0jrKV78cd7kFwllnp6jVhmCy5XMXJ/ozJIPPZqVvGwxEf/a7\nMJAwLWZ/VRZVwcBNspR2kVUqvQybaaYsbo0+jM5pGVq1S5NVreg7Iv563njqtPg9\noEaqLmNTwx+BTtR7V9XDbc3QLZM0fXIx19vBUegdXGYXV2+E7hPrMP746J2u1k/M\nk8I7P3GSmFFMM6p3slRju+QKjlUjUL1ue6Cvstr6X8Hkl9AoYVZIh6S/KD5kg4Xj\ny0taB3uxAgMBAAECggEABVi8cLQNJi9NnZXDxCA/9d4qB+BWuUqsnlrvwHvq19UL\n5PZ6mppIEuF4Dt9GUHxA7pHXVzbC7cl/MNkJdOvbzh832pSKwaYSgVRgnA3Gy+0w\n25Pv1fHCs3ZHhQGvyAQK4qYUJbD+cnjU9ID4xCbcE8D1Yx1cDzBJBO2HMhHtYZz5\ncc5nj1Ogp4IsKc+3WpwK8jqLuIXcvK3LbHbe30evcf3ieynfGVzHPGTKCEFkJhQm\nzXDE0SEifpDDVXF5PJvBK6ISRMJf3+5PKj5iCVB3j2LaiXTkx2z0OVGI2GphtRDI\nVA/Lc6cBU8k06Jz3VdUtOM+Jevk5dlAm1QRd+5ps5QKBgQDdEEfkne6qtAra+S7v\n0oiwep7x221rhEvEfBouRtNdy4/TDInzOU66wrvc1vlCjFEvllRexbZobxW9TpUx\n8GC8FWG0F5q+MQ5DYX2bdXnar7oG08kxYJ+kdO1d1ka6oQG0nsGWy+Bl4BzG0VsF\nYHC5BN0Gct0zRA9KEODhQyJtFQKBgQC8IYxPjJM9QYQosfLU/hK1VvN+/Aa9UFbn\nQ49A9Szo1s45qvbGR30XY0FK9K+w8nh7M+120ImVStfctRz1BZEHC+yuBLheNOws\ne8pj5keRrD5MZoCHm87IkibdXKmGSYi5ypZXW59wv6NsH2Nn+ZJghbl2XLC5s5TP\nMu7OUUrTLQKBgQCnV+rEcpW4XWCWUOmqHDrjNX/a4Fudd2GP1M5Q18ariyxN/ID1\nQR2LHVzvGUFJkkTm/CrUL2Ec/3J6guFIE4p29symcvPuI96DPWrDYxOia0IsZug3\n28gdy3HghhO2tak/3Kn5iE5PcG74RoVbtZy/QqI6fntakpvsWoiRnauS3QKBgFX6\n/yVcGe7lAoGW0mSFugcmtiJTDMF49j67ob0OUHgZtCam/CGiiokl07FuIt2781Rb\nZyvmIvsYOY+lNpbE9IND7+eYQKrNhSLPcLA3jn4FOnOwZQ2VJ+yC30BMGS5GbTZ8\nYDmMplHhQ88miUf7x+pVM23k7t/wMxJ/NKUWghwBAoGBAMJ/B5GTY6pwi/iwbtU7\nMzoCyaOxe41e+O94Nuw7JTub8doK81v0b1yW5tLcqaFflpzvDvdlFlT40uOQpDK9\nAM6H/8q823am0hIgfabCCJG2HYX/ocTPWWDq0B0jasjVQlxC1GBWj2wyQcrzU7uF\nm+BXJsYQhPz7tvLcfaQZmias\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-fbsvc@wandergenie-93c45.iam.gserviceaccount.com",
  client_id: "115900121780818863436",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40wandergenie-93c45.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

initializeApp({
  credential: cert(serviceAccount),
});

export const db = getFirestore();
