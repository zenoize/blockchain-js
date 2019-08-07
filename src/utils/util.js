export function delay () {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
    });
}