const BASE_URL = "https://api.scryfall.com";

const KEYS = {
    SELECTED_KEY: "selected_key",
    DECK: "deck"
}

const PATHS = {
    INDEX: "/index.html",
    ROOT: "/",
    SET: "/set.html",
    DECK: "/deck.html"
}

//On load
window.onload = () => { 
    switch (window.location.pathname) {
        case PATHS.INDEX:
        case PATHS.ROOT:
            fetchData(`${BASE_URL}/sets`, createAllSets);
            break;
        case PATHS.SET:
            
            break;
        case PATHS.DECK:
            break
        default:
            break;
    }
    
}

//Tratamiento para sets

const createSetCard = (setInfo) => { 
    const { name, releaseDate, cards, code, cardsUri, img } = setInfo;
    
    const container = document.createElement("article");
    container.classList.add("set-card");
    container.onclick = () => { 
        localStorage.setItem(KEYS.SELECTED_KEY, JSON.stringify(setInfo));
        window.location.href = "/set.html"
    }

    const cardHTML = `
        <h3> ${name} </h3>
                    
        <div class="info">
            <h4> Release: </h4>
            <p> ${releaseDate} </p>
        </div>
        <div class="info">
            <h4> Cards: </h4>
            <p> ${cards} </p>
        </div>
        <div class="info">
            <h4> Code: </h4>
            <p style="text-transform: uppercase;"> ${code} </p>
        </div>

        <div class="image-container">
            <img src="${img}" alt="${code}">
        </div>
    `;

    container.innerHTML = cardHTML;
    return container
}

const parseSetInfo = (rawSet) => { 
    const { code, name, search_uri, icon_svg_uri, card_count, released_at } = rawSet;
    return {
        code,
        name,
        releaseDate: released_at,
        cards: card_count,
        cardsUri: search_uri,
        img: icon_svg_uri
    }
}

const createAllSets = async ({ data:rawSets }) => { 
    const container = document.querySelector("#cards-container>#items");
    container.innerHTML = "";

    rawSets.forEach(rawSet => { 
        const card = createSetCard(parseSetInfo(rawSet));
        container.appendChild(card);
    });
}

const fetchData = async (uri, action) => { 
    try {
        const response = await fetch(uri);

        if (response.ok) {
            const data = await response.json();
            action(data);
        } else { 
            console.warn(`Esto me cayó: ${response.status}`);
        }
    } catch (error) {
        console.error("Algo salio mal :'v");
    }
}

