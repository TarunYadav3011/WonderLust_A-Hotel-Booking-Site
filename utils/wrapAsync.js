module.exports = (fn) => {
    return (ewq, res, next)  => {
        fn(ewq, res, next).catch(next);
    }
}