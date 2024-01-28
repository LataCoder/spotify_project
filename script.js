console.log("Hello Song Lover!");

let currentSong = new Audio();
let currFolder;
let artistName;
let songs = [];

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let as = div.getElementsByTagName("a")
  songs = []
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }
  }



  // Show all the songs in the playlist
  let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
  songUL.innerHTML = ""
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="logos/music.svg" alt="">
                          <div class="info">
                              <div class="artistname"> ${song.replaceAll("%20", " ")}</div>
                              <div>Harry</div>
                          </div>
                          <div class="playnow">
                              <span>Play Now</span>
                              <img class="invert" src="logos/play.svg" alt="">
                          </div> </li>`;
  }


  //attach listener to songlist
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      playMusic(e.querySelector(".artistname").innerHTML.trim())
    })
  })
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track

  if (!pause) {
    currentSong.play()
    document.querySelector(".play").src = "logos/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}


async function displayAlbum() {
  console.log("Displaying Album...");
  let fetchAlbum = await fetch("http://127.0.0.1:3000/songs/");
  let response = await fetchAlbum.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-2)[0];
      //fetch the folder.json to get the title,description and cover
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      let cardContainer = document.querySelector(".CardConatiner");
      cardContainer.innerHTML += `
        <div class="card" data-folder="${folder}">
          <div class="playbtn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100" height="100" fill="#000000">
           <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          </div>
          <img src="songs/${folder}/cover.png" alt="">
          <h3>${response.title}</h3>
          <p>${response.description}</p>
        </div>
      `;

    }
  };

  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      console.log("Fetching Songs")
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0])

    })
  })

}

async function main() {

  displayAlbum();

  let songs = await getsongs(`songs/others`);
  playMusic(songs[0], true);




  //Attach Event Listener to Play,Next And Previous
  let play = document.querySelector(".play");
  play.addEventListener("click", e => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/logos/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/logos/play.svg"
    }

  })

  let previous = document.querySelector(".previous")
  previous.addEventListener("click", e => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src)
    if (index == -1) {
      console.log("first song");
    }
    console.log(index, songs);
  })

  //attach listener to Songtime
  currentSong.addEventListener("timeupdate", e => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  })


  //attach an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100;
  })

  //attach an event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", e => {
    document.querySelector(".left").style.left = 0;
  })


  //attach an event listener to close-hamburger
  document.querySelector(".close-hamburger").addEventListener("click", e => {
    document.querySelector(".left").style.left = -160 + "%";
  })

  //add volume adjuster
  document.querySelector(".range").addEventListener("change", e => {
    currentSong.volume = parseInt(e.target.value) / 100;
    if (currentSong.volume == 0) {
      document.querySelector(".volume img").src = "/logos/mute.svg"
    }
    else {
      document.querySelector(".volume img").src = "/logos/volume.svg"
    }
  })







}

main();