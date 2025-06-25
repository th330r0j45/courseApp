# EC2 Deployment Guide

## 1. Primera vez - Setup
```bash
scp -i "tu-key.pem" setup-ec2-amazon-linux.sh ec2-user@tu-ec2-ip:~/
ssh -i "tu-key.pem" ec2-user@tu-ec2-ip
./setup-ec2-amazon-linux.sh
exit && ssh -i "tu-key.pem" ec2-user@tu-ec2-ip
```

## 2. Clonar y desplegar
```bash
git clone https://github.com/tu-usuario/tu-repo.git ~/courses
cd ~/courses
chmod +x *.sh
./deploy.sh
```

## 3. Futuras actualizaciones
```bash
./auto-deploy.sh
```

## 4. Monitoreo
```bash
./monitor-ec2.sh
```

## 5. SSL (Opcional - Solo si tienes dominio)
```bash
./setup-ssl.sh
```
Después de SSL:
# Para futuras actualizaciones con SSL
docker-compose -f docker/docker-compose-ssl.yaml up --build -d

# O usar el auto-deploy (detecta SSL automáticamente)
./auto-deploy.sh