export interface Site {
    name: string
    domain: string
    message: string
}


class Store {
    private static instance: Store
    private SitesSoftomate: Site[];
    private messageForAlert: string

    constructor() {
        if (Store.instance) {
            return Store.instance
        }
        Store.instance = this
    }

    setMessageForAlert(message: string) {
        this.messageForAlert = message
    }

    clearMessageForAlert() {
        this.messageForAlert = ''
    }

    getMessageForAlert() {
        if (this.messageForAlert) {
            return this.messageForAlert
        } else {
            return null
        }
    }

    setSitesSoftomate(site: Site[]) {
        this.SitesSoftomate = site
    }

    getSitesSoftomate() {
        if (this.SitesSoftomate && this.SitesSoftomate.length > 0) {
            return this.SitesSoftomate
        } else {
            return null
        }
    }
}

const store = new Store()

async function fetchSitesSoftomate(): Promise<Site[]> {
    const url = 'https://www.softomate.net/ext/employees/list.json';
    try {
        const responseJson = await fetch(url)
        const sites = await responseJson.json()
        store.setSitesSoftomate(sites)
        return sites
    } catch (error) {
        console.log('error fetchSitesSoftomate:', error);
    }
}

checkSitesSoftomateStore()

async function checkSitesSoftomateStore(): Promise<Site[]> {
    if (store.getSitesSoftomate()) {
        return store.getSitesSoftomate();
    } else {
        chrome.alarms.create("updateSitesSoftomate every hour", {periodInMinutes: 60.0})
        return await fetchSitesSoftomate()
    }
}


chrome.alarms.onAlarm.addListener((alarm) => {
    fetchSitesSoftomate()
})


chrome.runtime.onMessage.addListener((msg, sender, response) => {
    if (msg === 'checkSitesSoftomateStore') {
        checkSitesSoftomateStore()
            .then(sites => response(sites))
            .catch(error => console.error(error))
    }
    if (msg === 'getMessageForAlert') {
        response(store.getMessageForAlert())
    }
    return true
})


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        store.clearMessageForAlert()
        checkDomain(tab.url).then(() => {
            if (store.getMessageForAlert()) {
                chrome.scripting.executeScript({
                    target: {tabId: tabId},
                    files: ["content.js"]
                }).then(() => {
                    console.log(`INJECTED CONTENT SCRIPT ON ${tab.url}`);
                }).catch(err => console.log(`CONTENT` + err));

                chrome.scripting.insertCSS({
                    target: {tabId: tabId},
                    files: ["style.css"]
                }).then(() => {
                    console.log(`INJECTED STYLES ON ${tab.url}`);
                }).catch(err => console.log('STYLES' + err));
            }
        }).catch(error => console.error(error))
    }
});

async function checkDomain(currentUrl: string): Promise<void> {
    const sites = await checkSitesSoftomateStore()
    return sites.forEach((site: Site) => {
        if (currentUrl.indexOf(site.domain) !== -1) {
            setMessageCurrentPageInStore(site)
        }
    })


}

function setMessageCurrentPageInStore(site: Site) {
    const {message} = site
    if (message) {
        store.setMessageForAlert(message)
    }
}

