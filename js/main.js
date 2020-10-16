const BASE_URL = "https://api.scryfall.com";

const KEYS = {
    SELECTED_SET: "selected_set",
    DECK: "deck"
}

const PATHS = {
    INDEX: "/index.html",
    ROOT: "/",
    SET: "/set.html",
    DECK: "/deck.html"
}

//Mains
const indexMain = () => { 
    fetchData(`${BASE_URL}/sets`, createAllSets);
    document.querySelector(".deck-button>button").onclick = () => { 
        window.location.href = "./deck.html"
    }
}

const setMain = () => { 
    const setInfo = JSON.parse(localStorage.getItem(KEYS.SELECTED_SET));

    if (!setInfo) { 
        document.querySelector("title").innerText = "No selected set";
        document.querySelector("#title").innerText = "You don't select any set of cards";
        return;
    }

    document.querySelector("title").innerText = `Set: ${setInfo.name}`;
    document.querySelector("#title").innerText = setInfo.name;

    const { cardsUri } = setInfo;

    fetchData(cardsUri, createAllCards);
}

const deckMain = () => { 
    const deck = JSON.parse(localStorage.getItem(KEYS.DECK));
    createAllDeckCards(deck);
}

//On load
window.onload = () => { 
    document.addEventListener("keyup", (event) => {
        if (event.code === "Enter") { 
            const item = document.querySelector(":focus");
            if (item) item.click();
        }
    });
    
}

//Tratamiento para sets

const createSetCard = (setInfo) => { 
    const { name, releaseDate, cards, code, img } = setInfo;
    
    const container = document.createElement("article");
    container.classList.add("set-card");
    container.onclick = () => {
        localStorage.setItem(KEYS.SELECTED_SET, JSON.stringify(setInfo));
        window.location.href = "./set.html"
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
    const container = document.querySelector(".cards-container>.items");
    container.innerHTML = "";

    rawSets.forEach(rawSet => { 
        const card = createSetCard(parseSetInfo(rawSet));
        container.appendChild(card);
    });
}

//Tratamiento para cards
const createCardCard = (cardInfo) => { 
    const { img, name, id } = cardInfo;

    const container = document.createElement("article");
    container.classList.add("card-card");
    container.dataset.id = id;
    container.tabIndex = 0;
    container.setAttribute("role", "button");

    const { code } = JSON.parse(localStorage.getItem(KEYS.SELECTED_SET)) || undefined;

    if (isCardInDeck(id, code)) { 
        container.classList.add("decked")
    }

    container.onclick = () => { 
        toggleCardInDeck(cardInfo, code);
    }

    const cardHTML = `
        <img src="${img}" alt="${name}">
        <img class="check" src="./img/check.png" alt="Cheque"/>
        <div class="add"> <p>Add</p> </div>
        <div class="remove"> <p>Remove</p> </div>

    `;

    container.innerHTML = cardHTML;
    return container;
}

const parseCardInfo = (rawCard) => { 
    const { id, name, image_uris } = rawCard;
    return {
        id,
        name,
        img: image_uris.border_crop
    }
}

const createAllCards = async ({ data: rawCards}) => { 
    const container = document.querySelector(".cards-container>.items");
    container.innerHTML = "";

    rawCards.forEach(rawCard => {
        const card = createCardCard(parseCardInfo(rawCard));
        container.appendChild(card);
    });
}

const isSetInDeck = (code) => { 
    const deck = JSON.parse(localStorage.getItem(KEYS.DECK));
    if (!deck) return false;

    const set = deck[code];
    return set;
}

const isCardInDeck = (id, code) => { 
    if (!code) return false;

    const set = isSetInDeck(code);
    if (!set) return false
    
    const card = set[id];
    return card;
}

const toggleCardInDeck = (card, code) => { 
    const deck = JSON.parse(localStorage.getItem(KEYS.DECK)) || {};

    if (!isSetInDeck(code)) {
        deck[code] = {};
    }

    const cardCard = document.querySelector(`[data-id = "${card.id}"]`);

    if (!isCardInDeck(card.id, code)) {
        addCardToDeck(card, code, deck);
        cardCard.classList.add("decked");
    } else { 
        removeCardInDeck(card, code, deck);
        cardCard.classList.remove("decked");
    }    
}

const addCardToDeck = (card, setCode,  deck) => { 
    deck[setCode][card.id] = card;
    localStorage.setItem(KEYS.DECK, JSON.stringify(deck));
}

const removeCardInDeck = (card, setCode, deck) => { 
    deck[setCode][card.id] = undefined;
    localStorage.setItem(KEYS.DECK, JSON.stringify(deck));
}

//Deck management

const createCardOnDeck = (cardInfo, setCode) => { 
    const { img, name, id } = cardInfo;

    const container = document.createElement("article");
    container.classList.add("card-card");
    container.dataset.id = id
    container.tabIndex = 0;
    container.setAttribute("role", "button");

    if (isCardInDeck(id, setCode)) { 
        container.classList.add("decked")
    }

    container.onclick = () => { 
        removeCardInDeck(cardInfo, setCode, JSON.parse(localStorage.getItem(KEYS.DECK)));
        container.parentElement.removeChild(container);
    }

    const cardHTML = `
        <img src="${img}" alt="${name}">
        <div class="add"> <p>Add</p> </div>
        <div class="remove"> <p>Remove</p> </div>
    `;

    container.innerHTML = cardHTML;
    return container;
}

const createAllDeckCards = (deck) => { 
    const container = document.querySelector(".sets-in-deck");
    container.innerHTML = "";

    Object.keys(deck).forEach(set => { 
        if (Object.keys(deck[set]).length === 0) return;

        const section = document.createElement("section");
        section.innerHTML = `
        <section class="cards-container">
            <h2 style = "text-transform: uppercase;"> ${set} </h2>
            
            <div class="items">
            </div>
        </section>
        `;

        section.dataset.set = set;

        const items = section.querySelector(".items");

        Object.keys(deck[set]).forEach(cardId => { 
            const card = createCardOnDeck(deck[set][cardId], set);
            items.appendChild(card);
        });

        container.appendChild(section);
    })
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

