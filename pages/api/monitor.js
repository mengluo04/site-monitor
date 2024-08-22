import axios from "axios";
import cron from "node-cron";

const notifyUrl = "https://wxpusher.zjiecode.com/api/send/message"; // 通知的URL
const domains = process.env.MONITOR_DOMAINS.split(","); // 需要监控的域名列表
const uids = process.env.UIDS.split(","); // 需要发送通知的uids
const appToken = process.env.APP_TOKEN; // wxpusher的token

const notifyFailure = async (domain, error) => {
  try {
    await axios.post(notifyUrl, {
      uids: uids,
      appToken: appToken,
      contentType: "2",
      summary: "网站离线通知",
      content: "名称：" + domain + "\n" + "原因：" + error.message,
    });
  } catch (notifyError) {
    console.error("Failed to send notification:", notifyError.message);
  }
};

// 定时任务，每隔5分钟检测一次
cron.schedule("*/5 * * * *", async () => {
  for (const domain of domains) {
    try {
      const response = await axios.get(domain);
      dailyStatus[domain].success += 1;
      console.log(`Website is up: ${domain}`, response.status);
    } catch (error) {
      console.error(`Website is down: ${domain}`, error.message);
      await notifyFailure(domain, error);
    }
  }
});

export default (req, res) => {
  res.status(200).json({ message: "Uptime monitoring active." });
};
