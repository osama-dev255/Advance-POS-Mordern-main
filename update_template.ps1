$content = Get-Content 'f:\PROJECTS\POS MORDERN\Advance-POS-Mordern-main\src\pages\Templates.tsx'

$newContent = @()
$skipLines = $false

for ($i = 0; $i -lt $content.Length; $i++) {
    if ($content[$i].Trim() -eq "amountReceived: 0," -and 
        $i + 2 -lt $content.Length -and 
        $content[$i + 1].Trim() -eq "change: 0," -and
        $content[$i + 2].Trim() -eq "      };") {
        
        # Add the original lines plus the new ones
        $newContent += $content[$i]  # amountReceived: 0,
        $newContent += $content[$i + 1]  # change: 0,
        $newContent += "        amountPaid: invoiceData.amountPaid,"
        $newContent += "        creditBroughtForward: invoiceData.creditBroughtForward,"
        $newContent += "        amountDue: invoiceData.amountDue,"
        $newContent += "      };"
        
        # Skip the original three lines since we've added them with new content
        $i += 2
    } else {
        $newContent += $content[$i]
    }
}

$newContent | Set-Content 'f:\PROJECTS\POS MORDERN\Advance-POS-Mordern-main\src\pages\Templates.tsx'