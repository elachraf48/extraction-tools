import imaplib
import email
import os, sys
import re
from email.header import decode_header
from email.parser import BytesParser
from PyQt6 import QtCore, QtGui, QtWidgets
import json
import tkinter as tk
from tkinter import ttk, messagebox


class AddEmailPasswordDialog(QtWidgets.QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Add Email and Password")

        self.email_label = QtWidgets.QLabel("Email:")
        self.email_entry = QtWidgets.QLineEdit()

        self.password_label = QtWidgets.QLabel("Password:")
        self.password_entry = QtWidgets.QLineEdit()
        self.password_entry.setEchoMode(QtWidgets.QLineEdit.EchoMode.Password)

        self.save_button = QtWidgets.QPushButton("Save")
        self.save_button.clicked.connect(self.save_email_password)

        layout = QtWidgets.QGridLayout(self)
        layout.addWidget(self.email_label, 0, 0)
        layout.addWidget(self.email_entry, 0, 1)
        layout.addWidget(self.password_label, 1, 0)
        layout.addWidget(self.password_entry, 1, 1)
        layout.addWidget(self.save_button, 2, 0, 1, 2)

    def save_email_password(self):
        email = self.email_entry.text().strip()
        password = self.password_entry.text().strip()

        if email and password:
            email_address = email.strip()
            self.parent().email_password_dict[email_address] = password.strip()

            # Save the email and password to the data.json file
            with open("data.json", "r+") as file:
                email_password_data = json.load(file)
                email_password_data.append({"email": email_address, "password": password.strip()})
                file.seek(0)
                json.dump(email_password_data, file, indent=4)

            self.parent().selected_email_combo.addItem(email_address)
            self.parent().selected_email_combo.setCurrentIndex(
                self.parent().selected_email_combo.count() - 1
            )

            QtWidgets.QMessageBox.information(self, "Success", "Email and password saved successfully.")
            self.accept()
        else:
            QtWidgets.QMessageBox.warning(self, "Warning", "Email and password cannot be empty.")


class EmailExtractor(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        self.setup_ui()

        # Check if the data.json file exists
        if not QtCore.QFile.exists("data.json"):
            # Create an empty email_password_data list
            email_password_data = []

            # Write the empty list to the data.json file
            with open("data.json", "w") as file:
                json.dump(email_password_data, file)

        self.email_password_dict = {}

    def setup_ui(self):
        self.setWindowTitle("Email Extractor")

        self.email_provider_combo = QtWidgets.QComboBox()
        self.email_provider_combo.addItems(["Outlook", "Hotmail", "Yahoo", "Gmail", "AOL"])

        self.reload_button = QtWidgets.QPushButton("Reload")
        self.reload_button.clicked.connect(self.get_emails_by_provider)

        self.selected_email_label = QtWidgets.QLabel("Selected Email:")

        self.selected_email_combo = QtWidgets.QComboBox()

        self.extract_button = QtWidgets.QPushButton("Extract")
        self.extract_button.clicked.connect(self.extract_emails)

        self.add_button = QtWidgets.QPushButton("Add New Account")
        self.add_button.clicked.connect(self.add_email_password)

        self.delete_button = QtWidgets.QPushButton("Delete Account")
        self.delete_button.clicked.connect(self.remove_email_password)

        self.error_text = QtWidgets.QTextEdit()
        self.error_text.setReadOnly(True)

        central_widget = QtWidgets.QWidget()
        self.setCentralWidget(central_widget)

        layout = QtWidgets.QGridLayout(central_widget)
        layout.addWidget(QtWidgets.QLabel("Email Provider:"), 0, 0)
        layout.addWidget(self.email_provider_combo, 0, 1)
        layout.addWidget(self.reload_button, 1, 0, 1, 2)
        layout.addWidget(self.selected_email_label, 2, 0)
        layout.addWidget(self.selected_email_combo, 2, 1)
        layout.addWidget(self.extract_button, 3, 0, 1, 2)
        layout.addWidget(self.error_text, 4, 0, 1, 2)
        layout.addWidget(self.add_button, 5, 0, 1, 1)
        layout.addWidget(self.delete_button, 5, 1, 1, 2)

    def extract_emails(self):
        email_provider = self.email_provider_combo.currentText()
        selected_email = self.selected_email_combo.currentText()

        provider = email_provider.lower() + ".com"
        folder_name = email_provider

        # Connect to the IMAP server based on the email provider
        if email_provider == "Outlook" or email_provider == "Hotmail":
            mail = imaplib.IMAP4_SSL("imap-mail.outlook.com")
        elif email_provider == "Yahoo":
            mail = imaplib.IMAP4_SSL("imap.mail.yahoo.com")
        elif email_provider == "Gmail":
            mail = imaplib.IMAP4_SSL("imap.gmail.com")
        elif email_provider == "AOL":
            mail = imaplib.IMAP4_SSL("imap.aol.com")
        else:
            self.error_text.setText("Invalid email provider.")
            return

        # Fetch emails for the selected email account
        try:
            email_address, password = self.email_password_dict[selected_email]
            mail.login(email_address, password)
            mail.select(folder_name)
            _, message_numbers = mail.search(None, "ALL")
            message_numbers = message_numbers[0].split()

            self.error_text.clear()

            for message_number in message_numbers:
                _, message_data = mail.fetch(message_number, "(RFC822)")
                raw_email = message_data[0][1]
                email_message = email.message_from_bytes(raw_email)

                # Extract the full email source
                email_source = email_message.as_string()

                # Display the full email source
                self.error_text.append(email_source)
                self.error_text.append("--------------------")

        except Exception as e:
            self.error_text.setText(f"Error: {str(e)}")
            return

    def add_email_password(self):
        dialog = AddEmailPasswordDialog(self)
        if dialog.exec() == QtWidgets.QDialog.DialogCode.Accepted:
            QtWidgets.QMessageBox.information(self, "Success", "Email and password saved successfully.")

    def remove_email_password(self):
        selected_email = self.selected_email_combo.currentText()
        if selected_email:
            confirm = QtWidgets.QMessageBox.question(
                self,
                "Confirmation",
                f"Are you sure you want to remove the email '{selected_email}' and its password?",
                QtWidgets.QMessageBox.StandardButton.Yes | QtWidgets.QMessageBox.StandardButton.No,
            )
            if confirm == QtWidgets.QMessageBox.StandardButton.Yes:
                # Remove the email and its password from the dictionary and data.json file
                self.email_password_dict.pop(selected_email)
                with open("data.json", "r+") as file:
                    email_password_data = json.load(file)
                    email_password_data = [entry for entry in email_password_data if entry["email"] != selected_email]
                    file.seek(0)
                    json.dump(email_password_data, file, indent=4)

                self.selected_email_combo.removeItem(self.selected_email_combo.currentIndex())

                QtWidgets.QMessageBox.information(self, "Success", "Email and password removed successfully.")
        else:
            QtWidgets.QMessageBox.warning(self, "Warning", "No email selected.")


if __name__ == "__main__":
    import sys

    app = QtWidgets.QApplication(sys.argv)
    email_extractor = EmailExtractor()
    email_extractor.show()
    sys.exit(app.exec())
