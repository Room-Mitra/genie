References :
https://www.sammeechward.com/deploying-full-stack-js-to-aws-ec2


Commands :

1. Local Instance of EC2 : 
npm start

2. Code sync between local and EC2 : EC2 folder:
rsync -avz --exclude 'node_modules' --exclude '.git' \
-e "ssh -i ./config/ireland-adithya-macAir.pem" \
. ubuntu@ec2-34-240-95-34.eu-west-1.compute.amazonaws.com:~/app

3. EC2 log tail :  Ec2 > config
ssh -i "ireland-adithya-macAir.pem" ubuntu@ec2-34-240-95-34.eu-west-1.compute.amazonaws.com
sudo journalctl -fu myapp.service

4. Ec2 ssh systemmd
ssh -i "ireland-adithya-macAir.pem" ubuntu@ec2-34-240-95-34.eu-west-1.compute.amazonaws.com


-----------------------
Making https://theroomgenie.com point to your EC2-hosted Express server securely

Step 1: Point Domain to EC2
1. Go to Namecheap DNS settings
Find your domain theroomgenie.com
Click “Manage”

2. Under “Nameservers”, select:
Namecheap BasicDNS

3. Scroll to “Advanced DNS” tab
Add a new A Record:
Type: A Record
Host: @
Value: Your EC2 public IPv4 address
TTL: Automatic

Add another A Record for www:
Host: www
Value: Your EC2 public IP

✅ Wait 5–10 mins for DNS to propagate.
Test:
ping theroomgenie.com
You should see your EC2 IP.

Step 2: SSH into EC2 and Install Nginx
ssh -i your-key.pem ubuntu@<your-ec2-public-ip>
sudo apt update
sudo apt install nginx -y
Test by visiting http://theroomgenie.com — you should see the Nginx welcome page.


 Step 3: Configure Nginx as Reverse Proxy for Express
 Assume your Express app runs on port 3000.

Create a config file:
sudo nano /etc/nginx/sites-available/theroomgenie
PASTE ::
server {
    listen 80;
    server_name theroomgenie.com www.theroomgenie.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}


sudo ln -s /etc/nginx/sites-available/theroomgenie /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx


Step 4: Get SSL Certificate from Let’s Encrypt
Install Certbot:
sudo apt install certbot python3-certbot-nginx -y

Run Certbot:
sudo certbot --nginx -d theroomgenie.com -d www.theroomgenie.com

Follow the prompts. Certbot will:
Validate your domain
Automatically configure Nginx
Enable HTTPS!

Step 5: Enable Auto-Renewal
Certbot adds this by default, but to be safe:
sudo crontab -e
Add:
0 0 * * * /usr/bin/certbot renew --quiet



 Step 6: Test HTTPS
 https://theroomgenie.com  You should see your Express app working securely!

  ------- DEBUGGING ----------
  1. Make sure ports 80 and 443 are open in EC2
  2. Check Nginx is Running : "sudo systemctl status nginx". If not active -> "sudo systemctl start nginx"
     Enable it on boot: "sudo systemctl enable nginx"
  3. sudo systemctl restart nginx


  


Changes to be made ::
. Provide button in webapp to clear ec2 cache
. Logging and error handling
. EC2 cache should have TTL
. Uncached Webapp api calls should get uncached EC2 results
. CICD pipeline
. Register device intent confirmation needs to be fixed


PUSHING logs TO CLOUDWATCH
     
Prerequisites
EC2 instance running Ubuntu (with internet access).

IAM Role or instance profile attached with CloudWatchAgentServerPolicy.

Your Express app writes logs to a specific file (e.g., /var/log/express-app.log).

📦 1. Install the CloudWatch Agent
cd /tmp
curl -O https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

📁 2. Set Up Log Directory and Permissions
Let’s assume your app will log to /var/log/express-app.log.
sudo mkdir -p /var/log
sudo touch /var/log/express-app.log
sudo chown ubuntu:ubuntu /var/log/express-app.log
Replace ubuntu with your actual EC2 username (whoami shows it).

Ensure your app has permissions to write to the file.

🧾 3. Create CloudWatch Agent Configuration File
Create a file named cwagent-config.json with the following content:
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/express-app.log",
            "log_group_name": "RoomMitraAppLogs",
            "log_stream_name": "{instance_id}",
            "timestamp_format": "%Y-%m-%d %H:%M:%S",
            "multi_line_start_pattern": "(\\d{4}-\\s{0,1}\\d{1,2}-\\s{0,1}\\d{1,2} \\d{2}:\\d{2}:\\d{2})"
          }
        ]
      }
    },
    "log_stream_name": "default-log-stream",
    "log_group_name": "RoomMitraAppLogs"
  }
}
Explanation:
file_path: your app's log file.
log_group_name: name in CloudWatch Logs (will be auto-created).
log_stream_name: {instance_id} auto-resolves to EC2 ID.
timestamp_format: update this to match your log line format, e.g., 2025-07-18 12:34:56.
multi_line_start_pattern: use regex if your logs span multiple lines.

💾 4. Place the Config File
sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc/
sudo cp cwagent-config.json /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
🚀 5. Start CloudWatch Agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
  -s
This command:
Fetches config from file.
Starts agent in EC2 mode.

🔁 6. Make Sure Logs Are Written by App
Run this to test:
echo "2025-07-18 18:42:10 Sample log from Express app" >> /var/log/express-app.log
Or update your app’s console.log or logger to write to /var/log/express-app.log.

✅ 7. Verify Setup
Check CloudWatch Logs (Console):
Go to CloudWatch Logs console
Look for RoomMitraAppLogs log group.
Inside, find a stream named after your EC2 instance ID.

🛠️ 8. Troubleshooting
Check if agent is running:
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a status
Check agent logs:
cat /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
Permissions issue?
Ensure:
EC2 role has policy CloudWatchAgentServerPolicy.
IAM trust relationship allows EC2.

🔄 9. Restarting the Agent (if needed)
After config changes:
sudo systemctl restart amazon-cloudwatch-agent

🧹 10. Cleanup (Optional)
To remove agent:
sudo systemctl stop amazon-cloudwatch-agent
sudo apt remove amazon-cloudwatch-agent




