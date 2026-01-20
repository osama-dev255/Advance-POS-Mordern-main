#!/usr/bin/env python3

# Read the file
with open('f:\\PROJECTS\\POS MORDERN\\Advance-POS-Mordern-main\\src\\pages\\Templates.tsx', 'r', encoding='latin-1') as f:
    content = f.read()

# Define the pattern and replacement
pattern = '''        amountReceived: 0,
        change: 0,
      };'''

replacement = '''        amountReceived: 0,
        change: 0,
        amountPaid: invoiceData.amountPaid,
        creditBroughtForward: invoiceData.creditBroughtForward,
        amountDue: invoiceData.amountDue,
      };'''

# Perform the replacement
updated_content = content.replace(pattern, replacement)

# Write the file back
with open('f:\\PROJECTS\\POS MORDERN\\Advance-POS-Mordern-main\\src\\pages\\Templates.tsx', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("File updated successfully!")