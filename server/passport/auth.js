module.exports = {
    requireLogin: function(req, res, next) {
        if (req.user) {
            next();
        } else {
            res.redirect('/');
        }
    }
    // ifIsAdmin: function(req, res, next) {
    //     if (req.user && req.user.isAdmin) {
    //         next();
    //     } else {
    //         res.redirect('/');
    //     }
    // },
    // // Checks that requests to change an account are coming from the account holder.
    // ifIsAuthorized: function(req, res, next) {
    //     if (req.user._id === req.params.id || req.user.isAdmin) {
    //         next(); 
    //     } else {
    //         res.redirect('/');
    //     }
    // },
    // // Checks that a request to modify a Post is coming from the creator of that Post (Or an admin)
    // ifIsContentOriginator: function(req, res, next){
    //     Post.findById(req.params.id).exec(function (err, result) {
    //         if (err) {
    //             res.redirect('/');
    //         } else if (result.isAdmin || (req.user._id === result.sharedBy.id)) {
    //             next();
    //         } else {
    //             res.redirect('/');
    //         }
    //     });
    // }
}