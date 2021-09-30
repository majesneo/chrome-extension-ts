import {Site} from "./background";


declare var $: any;
declare global {
    interface Window {
        type: Window,
        $: {
            type: () => void
            create: () => void
        },
    }
}


window.onload = () => {
    window.$ = document.querySelector.bind(document)
    window.$.create = document.createElement.bind(document)

    interface PopupSites {
        getSites: () => Promise<Site[]>
    }


    class SitesSoftomate implements PopupSites {
        getSites(): Promise<Site[]> {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage('checkSitesSoftomateStore', (sites) => {
                    if (sites) {
                        resolve(sites);
                    } else {
                        reject('Something wrong');
                    }
                })
            })
        }
    }

    class PopupService {
        constructor(public PopupSites: PopupSites) {
        }

        async render() {
            const item = $('.list__item')
            const payload = await this.PopupSites.getSites()
            if (payload && payload.length > 0) {
                for (let index = 0; index < payload.length; index++) {
                    const link = $.create('a');
                    link.textContent = payload[index].name;
                    link.href = 'https://' + payload[index].domain
                    link.setAttribute('target', '_blank');
                    item.append(link);
                }
            }
        }
    }

    const popupService = new PopupService(new SitesSoftomate())
    popupService.render()
}
