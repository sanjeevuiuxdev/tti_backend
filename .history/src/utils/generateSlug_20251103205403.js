function generateSlug(text = '') {
    return text
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')   // remove weird chars
      .replace(/\s+/g, '-')           // spaces -> dash
      .replace(/-+/g, '-');           // no double dash
  }
  
  module.exports = generateSlug;
  