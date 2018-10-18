DROP DATABASE IF EXISTS bamazon_db;

CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT(10) NOT NULL,
  PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES
("Men's T-Shirt", "Clothing", 10.00, 25),
("Women's T-Shirt", "Clothing", 12.50, 30),
("Noise-Cancelling Headphones", "Electronics", 349.99, 5),
("Earbuds", "Electronics", 7.99, 15),
("Square Throw Pillow", "Home", 25.00, 10),
("Fuzzy Throw Blanket", "Home", 13.49, 13),
("Vanity Mirror", "Home", 9.59, 8),
("Artificial Potted Plant", "Home", 15.00, 12),
("Micro USB Cable", "Eletronics", 14.50, 27),
("Knit Beanie", "Clothing", 10.00, 30);

SELECT * FROM products;