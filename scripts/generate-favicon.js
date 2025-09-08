const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    // Read the navbar logo
    const logoPath = path.join(__dirname, '../public/navbar-logo.png');
    
    if (!fs.existsSync(logoPath)) {
      console.error('Navbar logo not found at:', logoPath);
      return;
    }

    // Generate favicon with multiple sizes
    const sizes = [16, 32, 48];
    const buffers = await Promise.all(
      sizes.map(size =>
        sharp(logoPath)
          .resize(size, size, { 
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 } 
          })
          .png()
          .toBuffer()
      )
    );

    // Create ICO file
    const toIco = require('to-ico');
    const icoBuffer = await toIco(buffers);
    
    // Write to public directory
    const faviconPath = path.join(__dirname, '../public/favicon.ico');
    fs.writeFileSync(faviconPath, icoBuffer);
    
    console.log('Favicon generated successfully at:', faviconPath);
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon();