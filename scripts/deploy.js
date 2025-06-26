import FtpDeploy from "ftp-deploy";
const ftpDeploy = new FtpDeploy();

const config = {
  user: process.env.username || "",        // from GitHub Actions env
  password: process.env.password || "",    // from GitHub Actions env
  host: process.env.server || "",          // from GitHub Actions env
  port: 21,
  localRoot: "./.next",                     // relative path inside GitHub runner
  remoteRoot: ".next/",
  include: ["**/*"],
  deleteRemote: true,
  forcePasv: true,
};

ftpDeploy
  .deploy(config)
  .then(() => console.log("✅ Deployed successfully!"))
  .catch((err) => console.error("❌ Deployment failed:", err));
