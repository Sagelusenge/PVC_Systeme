CREATE USER IF NOT EXISTS 'pvc_app'@'localhost' IDENTIFIED BY 'change_me_strong_password';
CREATE USER IF NOT EXISTS 'pvc_app'@'127.0.0.1' IDENTIFIED BY 'change_me_strong_password';

GRANT ALL PRIVILEGES ON db_pvc_renovee.* TO 'pvc_app'@'localhost';
GRANT ALL PRIVILEGES ON db_pvc_renovee.* TO 'pvc_app'@'127.0.0.1';

FLUSH PRIVILEGES;
