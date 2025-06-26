import FtpDeploy from "ftp-deploy";
const ftpDeploy = new FtpDeploy();

const config = {
  user: "sample@sample.southernleyte.org.ph",
  password: ",rZ5q0;RQU2^nd9*",
  host: "103.131.95.66",
  port: 21,
  localRoot: "C:/Users/Asus/Documents/nextjs-graphql-honojs-starterkit/public",
  remoteRoot: "/",
  include: ["**/*"],
  deleteRemote: true,
  forcePasv: true,
};

ftpDeploy
  .deploy(config)
  .then(() => console.log("✅ Deployed successfully!"))
  .catch(err => console.error("❌ Deployment failed:", err));