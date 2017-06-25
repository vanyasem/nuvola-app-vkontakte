/*
 * Copyright 2017 Ivan Semkin <ivan@semkin.ru>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

(function(Nuvola)
{

// Create media player component
var player = Nuvola.$object(Nuvola.MediaPlayer);

// Handy aliases
var PlaybackState = Nuvola.PlaybackState;
var PlayerAction = Nuvola.PlayerAction;

// Create new WebApp prototype
var WebApp = Nuvola.$WebApp();

// Initialization routines
WebApp._onInitWebWorker = function(emitter)
{
    Nuvola.WebApp._onInitWebWorker.call(this, emitter);

    this.state = PlaybackState.UNKNOWN;

    var state = document.readyState;
    if (state === "interactive" || state === "complete")
        this._onPageReady();
    else
        document.addEventListener("DOMContentLoaded", this._onPageReady.bind(this));
}

// Page is ready for magic
WebApp._onPageReady = function()
{
    // Connect handler for signal ActionActivated
    Nuvola.actions.connect("ActionActivated", this);
    // Start update routine
    this.update();
}

// Extract data from the web page
WebApp.update = function()
{

    this.state = PlaybackState.UNKNOWN;

    var track = {
        title: null,
        artist: null,
        album: null,
        artLocation: null,
        rating: null
    }

    var title = document.getElementsByClassName('audio_page_player_title_song')[0].innerText;
    track.title = title.substring(3, title.length);
    track.artist = document.getElementsByClassName('audio_page_player_title_performer')[0].innerText;

    player.setTrack(track);
    player.setPlaybackState(this.state);
    player.setCanPause(this.state === PlaybackState.PLAYING);
    player.setCanPlay(this.state === PlaybackState.PAUSED || this.state === PlaybackState.UNKNOWN);
    player.setCanGoPrev(true);
    player.setCanGoNext(true);

    // Schedule the next update
    setTimeout(this.update.bind(this), 500);
}

// Handler of playback actions
WebApp._onActionActivated = function(emitter, name, param)
{
    var prevSong = this._getGoPrevButton();
    var nextSong = this._getGoNextButton();
    var playPause = this._getPlayPauseButton();

    switch (name) {
        /* Base media player actions */
        case PlayerAction.TOGGLE_PLAY:
            playPause.click();
            break;
        case PlayerAction.PLAY:
            if (this.state !== PlaybackState.PLAYING)
                playPause.click();
            break;
        case PlayerAction.PAUSE:
        case PlayerAction.STOP:
            if (this.state === PlaybackState.PLAYING)
                playPause.click();
            break;
        case PlayerAction.PREV_SONG:
            if (prevSong)
                prevSong.click();
            break;
        case PlayerAction.NEXT_SONG:
            if (nextSong)
                nextSong.click();
            break;
    }
}

WebApp._getButton = function(id)
{
    return document.getElementsByClassName(id)[0];
}

WebApp._getPlayPauseButton = function()
{
    return this._getButton("top_audio_player_play");
}

WebApp._getGoPrevButton = function()
{
    return this._getButton("top_audio_player_prev");
}

WebApp._getGoNextButton = function()
{
    return this._getButton("top_audio_player_next");
}

WebApp._getShuffleButton = function()
{
    return this._getButton("audio_page_player_shuffle");
}

WebApp.start();

})(this);
