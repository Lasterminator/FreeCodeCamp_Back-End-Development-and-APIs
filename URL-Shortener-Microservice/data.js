// store original url with its short url value
let urls = {}

let shortUrlValue = 0

// save the url and the current available value for short url in 'urls' object
function shorten_URL(url) {
    urls[shortUrlValue] = url
    let response = { 'original_url': url, 'short_url': shortUrlValue }
    shortUrlValue++

    return response
}

function getUrl(shortUrl) {
    // if the short url found in 'urls' return the original url of it
    if (urls.hasOwnProperty(shortUrl)) {
        return urls[shortUrl]
    }
    return undefined
}

module.exports = {
    shorten_URL: shorten_URL,
    getUrl: getUrl
}