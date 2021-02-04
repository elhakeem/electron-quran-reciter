const axios = require('axios');
let meta;
let selectedSurah = 0;
let min = 0;
let max = 0;
let selectedVerses = [];
let playing = false;
let playingVerse = 1;
window.onload = () => {
    getAllSurahs();
}
const getAllSurahs = async () => {
    try {
        const res = await axios({
            url: 'http://api.alquran.cloud/v1/meta',
            method: 'get'
        })
        meta = res.data.data;
        listAllSurahs();
    } catch (error) {
        console.log("error getting meta data", error)
    }
    addSubmitListener();
}

const listAllSurahs = () => {
    const select = document.getElementById('surahs');
    meta.surahs.references.forEach(surah => {
        const option = document.createElement('option');
        option.innerHTML = surah.name;
        option.setAttribute("value", surah.number);
        select.appendChild(option);
    })
    select.addEventListener("change", event => {
        selectedSurah = Number(event.target.value);
        applyFromToLimits();
    })
}

const applyFromToLimits = () => {
    const from = document.getElementById("from-verse");
    const to = document.getElementById("to-verse");
    const selected = meta.surahs.references.find(surah => surah.number === selectedSurah);
    from.setAttribute("max", selected.numberOfAyahs)
    to.setAttribute("max", selected.numberOfAyahs)
    max = selected.numberOfAyahs;
}

const addSubmitListener = () => {
    document.getElementById("submit").addEventListener("click", event => {
        const from = document.getElementById("from-verse").value;
        const to = document.getElementById("to-verse").value;
        const allVerses = [];
        for (let ayah = Number(from); ayah <= Number(to); ayah++) {
            allVerses.push(getVerse(selectedSurah, ayah));
        }
        Promise.all(allVerses).then(succ => {
            selectedVerses = succ.map(res => res.data.data);
            genereteText();
            getAudio();
        }).catch(err => { console.log(err) })
    })
}

const getVerse = (surah, verse) => {
    return axios.get(`http://api.alquran.cloud/v1/ayah/${surah}:${verse}`);
}

const genereteText = () => {
    const main = document.getElementById('text');
    main.innerHTML = '';
    selectedVerses.forEach(verse => {
        const span = document.createElement('span');
        span.innerHTML = `${verse.text} {${verse.number}}`;
        main.appendChild(span)
    });
}
const getAudio = () => {
    const player = document.getElementById("audio-list")
    player.innerHTML = "";
    selectedVerses.forEach(verse => {
        const audio = createAudioTag(verse);
        player.appendChild(audio)
    });
    document.getElementById("play").addEventListener('click', () => {
        if(!playing) {
            play()
        }
        else {
            stop()
        }
    })
}
const play = () => {
    document.querySelector(`#audio-list > audio:nth-child(${playingVerse})`).play();
    highlightVerse();
    nextVerse();
}
const stop = () => {
    const audio = document.querySelector(`#audio-list > audio:nth-child(${playingVerse - 1})`)
    audio.pause();
    audio.currentTime = 0;
    resetToFirstVerse();
}
const nextVerse = () => {
    playingVerse++;
    playing = true;
}
const resetToFirstVerse = () => {
    removePrevVerseHighlight();
    playingVerse = 1;
    playing = false;
}
const createAudioTag = verse => {
    const audio = document.createElement('audio');
    audio.setAttribute('type', 'audio/mp3');
    audio.setAttribute('src', `http://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/${verse.number}/low`);
    audio.addEventListener('ended', () => {
        if (playingVerse > selectedVerses.length) {
            resetToFirstVerse();
        }
        removePrevVerseHighlight();
        play();
    })
    return audio;
}
const highlightVerse = () => {
    const verse = document.querySelector(`#text > span:nth-child(${playingVerse})`);
    verse.classList.add("highlighted");
    window.scrollTo(0, verse.offsetTop - 100)
}
const removePrevVerseHighlight = () => {
    const prevVerse = document.querySelector(`#text > span:nth-child(${playingVerse-1})`);
    if (prevVerse) {
        prevVerse.classList.remove("highlighted")
    }
}
