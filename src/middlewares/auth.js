module.exports = (req, res ,next) => {
    const authHearders = req.headers.authorization;

    if (!authHearders) {
        return res.status(401).send({error: 'No token provided'});
    }
}