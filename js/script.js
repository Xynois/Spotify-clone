let currSong = new Audio();
let songs;
let currFolder;

//seconds to minutes function
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < anchors.length; index++) {
        const element = anchors[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    //show all songs in the playlist
    let songUl = document
        .querySelector(".songList")
        .getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML =
            songUl.innerHTML +
            `<li class="listOfSongs">
        <img class="invert" src="img/music.svg" alt="">
        <div class="info">
            <div class="songname">
            ${song.replaceAll("%20", " ")}
            </div>
            <div class="artist">
                Song Artist
            </div>
        </div>
        <div class="playnow">
            <img class="invert" src="img/libPlay.svg" alt="">
        </div>
        </li>`;
    }

    //attach and event listener to each song
    Array.from(
        document.querySelector(".songList").getElementsByTagName("li")
    ).forEach((e) => {
        e.addEventListener("click", (element) => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs;
}
const playMusic = (track, pause = false) => {
    currSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songInfo").style = "padding-bottom:10px;";
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
    document.querySelector(".songTime").style = "padding-bottom:10px;";
};
async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
            <img src="img/cardPlay.svg" alt="play-button">
            </div>
            <img class="rounded" src="/songs/${folder}/cover.jpeg" alt="">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

        })
    })
}
// main function 
async function main() {
    //get all the list of songs
    await getsongs("songs/MetroBoomin");
    playMusic(songs[0], true);
    // Display all the albums on the page
    await displayAlbums()
    //attach even listener to play,next and previous
    play.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play();
            play.src = "img/pause.svg"
        } else {
            currSong.pause();
            play.src = "img/play.svg"
        }
    });
    //update time
    currSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(
            currSong.currentTime
        )}/${secondsToMinutesSeconds(currSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currSong.currentTime / currSong.duration) * 100 + "%";
    });
    // add an event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const seek = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = seek + "%";
        currSong.currentTime = (currSong.duration * seek) / 100;
    });
    //add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    //add event listener to cross
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
    let previous = document.querySelector("#previous");
    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currSong.pause();
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Add an event listener to next
    let next = document.querySelector("#next");

    next.addEventListener("click", () => {
        currSong.pause();

        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // Add an event to volume
    document
        .querySelector(".range")
        .getElementsByTagName("input")[0]
        .addEventListener("change", (e) => {
            console.log("Setting volume to", e.target.value, "/ 100");
            currSong.volume = parseInt(e.target.value) / 100;
            if (currSong.volume > 0) {
                document.querySelector(".volume>img").src = document
                    .querySelector(".volume>img")
                    .src.replace("img/mute.svg", "img/volume.svg");
            }
        });

    // Add event listener to mute the track
    document
        .querySelector(".volume>img")
        .addEventListener("click", (e) => {
            if (e.target.src.includes("img/volume.svg")) {
                e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
                currSong.volume = 0;
                document
                    .querySelector(".range")
                    .getElementsByTagName("input")[0].value = 0;
            } else {
                e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
                currSong.volume = 0.1;
                document
                    .querySelector(".range")
                    .getElementsByTagName("input")[0].value = 10;
            }
        });

}
main(); 
