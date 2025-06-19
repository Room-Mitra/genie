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

desicontent691969@gmail.com
dummy commit