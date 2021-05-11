import { Component } from '@angular/core';
declare var MediaRecorder: any;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  recorderTracks:HTMLAudioElement[]=[];
  fileReader = new FileReader();
  audioContext = new AudioContext();
  isCandleLit=true;

  constructor() {}

  ionViewDidEnter(){
    this.litCandle();
  }

  recordAudio(){
    if(this.isCandleLit){
      navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.addEventListener("dataavailable", event => {    
          this.fileReader.readAsDataURL(event.data); 
          this.fileReader.onloadend = ()=> {
            var base64data = this.fileReader.result+"";
            this.recorderTracks.push(new Audio(base64data));
            setTimeout(()=>{
              this.recordAudio();
            },10);
          }
          
        });
        mediaRecorder.start();
        setTimeout(() => {
          mediaRecorder.stop();
        }, 1000);
      })
    }
    
  }

  async playTracks(){
    if(this.recorderTracks.length>3){
      this.recorderTracks=[];
    }
    if(this.recorderTracks.length>0){
      let audio=this.recorderTracks.shift();
      if(this.isCandleLit){
        await this.detectBlow(audio);
      }
      
      
    }else{
      setTimeout(()=>{
        this.playTracks();
      },100);
    }
  }

  litCandle(){
    this.isCandleLit=true;
    this.recordAudio();
    this.playTracks();
  }

  blowCandle(){
    if(this.isCandleLit){
      console.log("fukl @"+new Date());
      this.isCandleLit=false;
      this.recorderTracks=[];
    }
  }

  async detectBlow(audio:HTMLAudioElement){
    let audioContext = new AudioContext();
    var src = audioContext.createMediaElementSource(audio);
    var analyser = audioContext.createAnalyser();
    analyser.fftSize = 32;
    src.connect(analyser);
    analyser.connect(audioContext.destination);
    
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    let analizer=()=>{
      setTimeout(()=>{
        requestAnimationFrame(analizer);
        analyser.getByteFrequencyData(dataArray);
        if(dataArray[10]>1){
          this.blowCandle();
        }
      },100);
    }
  
    audio.play();
    audio.volume=0.1;
    analizer();
    audio.onended=()=>{
      this.playTracks();
    }
  }
}
