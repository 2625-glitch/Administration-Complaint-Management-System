const handlebars = require('handlebars');

// Custom helper to compare two values for equality
handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

module.exports = handlebars;
