mongoose = require('mongoose');

module.exports = {
    inviteFirstUser: function() {
    query userdb 
        if empty
            query invite code DB 
                if empty
                    display "connected to empty database"
                    ask "You will need an invite code to administer your website, would you like to generate one?"
                    generate invite code with note: 'SITE ADMIN'
                        display invite code
                else
                    display invite code
        else
            do nothing
    }
};