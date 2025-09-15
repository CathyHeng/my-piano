// Mac Piano Classic - JavaScript
class MacPiano {
    constructor() {
        this.audioContext = null;
        this.currentOctave = 4;
        this.masterVolume = 0.7;
        this.sustainMode = false;
        this.activeNotes = new Map();
        this.sustainedNotes = new Set();
        this.currentInstrument = 'piano'; // Default instrument
        
        // Recording functionality
        this.isRecording = false;
        this.isPlaying = false;
        this.recordedSequence = [];
        this.recordingStartTime = null;
        this.playbackTimer = null;
        
        // Song autoplay functionality
        this.isPlayingSong = false;
        this.songTimer = null;
        this.currentSong = null;
        
        // Teaching mode functionality
        this.isTeaching = false;
        this.currentNoteIndex = 0;
        this.teachingSong = null;
        this.waitingForNote = false;
        this.teachingTimeouts = []; // Track teaching-related timeouts
        
        // Note frequencies (A4 = 440Hz)
        this.noteFrequencies = {
            'C': 261.63,
            'C#': 277.18,
            'D': 293.66,
            'D#': 311.13,
            'E': 329.63,
            'F': 349.23,
            'F#': 369.99,
            'G': 392.00,
            'G#': 415.30,
            'A': 440.00,
            'A#': 466.16,
            'B': 493.88
        };
        
        // Keyboard mapping for computer keys - Traditional piano layout
        this.keyboardMap = {
            // First octave white keys (A S D F G H J)
            'KeyA': { note: 'C', octaveOffset: 0 },      // C4
            'KeyS': { note: 'D', octaveOffset: 0 },      // D4  
            'KeyD': { note: 'E', octaveOffset: 0 },      // E4
            'KeyF': { note: 'F', octaveOffset: 0 },      // F4
            'KeyG': { note: 'G', octaveOffset: 0 },      // G4
            'KeyH': { note: 'A', octaveOffset: 0 },      // A4
            'KeyJ': { note: 'B', octaveOffset: 0 },      // B4
            
            // Second octave white keys (K L ; ' \ Z X)
            'KeyK': { note: 'C', octaveOffset: 1 },      // C5
            'KeyL': { note: 'D', octaveOffset: 1 },      // D5
            'Semicolon': { note: 'E', octaveOffset: 1 }, // E5
            'Quote': { note: 'F', octaveOffset: 1 },     // F5
            'Backslash': { note: 'G', octaveOffset: 1 }, // G5
            'KeyZ': { note: 'A', octaveOffset: 1 },      // A5
            'KeyX': { note: 'B', octaveOffset: 1 },      // B5
            
            // First octave black keys (W E T Y U)
            'KeyW': { note: 'C#', octaveOffset: 0 },     // C#4 (between A-S)
            'KeyE': { note: 'D#', octaveOffset: 0 },     // D#4 (between S-D)
            'KeyT': { note: 'F#', octaveOffset: 0 },     // F#4 (between F-G)
            'KeyY': { note: 'G#', octaveOffset: 0 },     // G#4 (between G-H)  
            'KeyU': { note: 'A#', octaveOffset: 0 },     // A#4 (between H-J)
            
            // Second octave black keys (I O P [)
            'KeyI': { note: 'C#', octaveOffset: 1 },     // C#5 (between K-L)
            'KeyO': { note: 'D#', octaveOffset: 1 },     // D#5 (between L-;)
            'KeyP': { note: 'F#', octaveOffset: 1 },     // F#5 (between '-\)
            'BracketLeft': { note: 'G#', octaveOffset: 1 }, // G#5 (after \)
            'BracketRight': { note: 'A#', octaveOffset: 1 }, // A#5
        };
        
        // Song definitions
        this.songs = {
            furElise: {
                name: "Für Elise",
                notes: [
                    // First phrase: ; O ; O ; J L K H
                    {note: 'E', octaveOffset: 1, duration: 400, delay: 0},     // ; key
                    {note: 'D#', octaveOffset: 1, duration: 400, delay: 400}, // O key
                    {note: 'E', octaveOffset: 1, duration: 400, delay: 800},   // ; key
                    {note: 'D#', octaveOffset: 1, duration: 400, delay: 1200}, // O key
                    {note: 'E', octaveOffset: 1, duration: 400, delay: 1600},  // ; key
                    {note: 'B', octaveOffset: 0, duration: 400, delay: 2000},  // J key
                    {note: 'D', octaveOffset: 1, duration: 400, delay: 2400},  // L key
                    {note: 'C', octaveOffset: 1, duration: 400, delay: 2800},  // K key
                    {note: 'A', octaveOffset: 0, duration: 600, delay: 3200},  // H key
                    
                    // Pause
                    {note: 'REST', duration: 400, delay: 3800},
                    
                    // Second phrase: D H H J
                    {note: 'E', octaveOffset: 0, duration: 400, delay: 4200},  // D key
                    {note: 'A', octaveOffset: 0, duration: 400, delay: 4600},  // H key
                    {note: 'A', octaveOffset: 0, duration: 400, delay: 5000},  // H key
                    {note: 'B', octaveOffset: 0, duration: 600, delay: 5400},  // J key
                    
                    // Pause
                    {note: 'REST', duration: 400, delay: 6000},
                    
                    // Third phrase: D H J K
                    {note: 'E', octaveOffset: 0, duration: 400, delay: 6400},  // D key
                    {note: 'A', octaveOffset: 0, duration: 400, delay: 6800},  // H key
                    {note: 'B', octaveOffset: 0, duration: 400, delay: 7200},  // J key
                    {note: 'C', octaveOffset: 1, duration: 600, delay: 7600},  // K key
                    
                    // Pause
                    {note: 'REST', duration: 400, delay: 8200},
                    
                    // Fourth phrase (repeat opening): D ; O ; O ; J L K H
                    {note: 'E', octaveOffset: 0, duration: 400, delay: 8600},  // D key
                    {note: 'E', octaveOffset: 1, duration: 400, delay: 9000},  // ; key
                    {note: 'D#', octaveOffset: 1, duration: 400, delay: 9400}, // O key
                    {note: 'E', octaveOffset: 1, duration: 400, delay: 9800},  // ; key
                    {note: 'D#', octaveOffset: 1, duration: 400, delay: 10200}, // O key
                    {note: 'E', octaveOffset: 1, duration: 400, delay: 10600}, // ; key
                    {note: 'B', octaveOffset: 0, duration: 400, delay: 11000}, // J key
                    {note: 'D', octaveOffset: 1, duration: 400, delay: 11400}, // L key
                    {note: 'C', octaveOffset: 1, duration: 400, delay: 11800}, // K key
                    {note: 'A', octaveOffset: 0, duration: 600, delay: 12200}, // H key
                    
                    // Pause
                    {note: 'REST', duration: 400, delay: 12800},
                    
                    // Fifth phrase: D H H J
                    {note: 'E', octaveOffset: 0, duration: 400, delay: 13200}, // D key
                    {note: 'A', octaveOffset: 0, duration: 400, delay: 13600}, // H key
                    {note: 'A', octaveOffset: 0, duration: 400, delay: 14000}, // H key
                    {note: 'B', octaveOffset: 0, duration: 600, delay: 14400}, // J key
                    
                    // Pause
                    {note: 'REST', duration: 400, delay: 15000},
                    
                    // Final phrase: D K J H
                    {note: 'E', octaveOffset: 0, duration: 400, delay: 15400}, // D key
                    {note: 'C', octaveOffset: 1, duration: 400, delay: 15800}, // K key
                    {note: 'B', octaveOffset: 0, duration: 400, delay: 16200}, // J key
                    {note: 'A', octaveOffset: 0, duration: 800, delay: 16600}  // H key (final note, longer)
                ]
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeAudio();
        this.generateKeyboard();
        
        // Hide piano icon initially since piano window is open by default
        document.getElementById('pianoIcon').classList.add('hidden');
    }
    
    setupEventListeners() {
        // macOS Window Controls
        document.getElementById('closeMac').addEventListener('click', () => {
            this.closePiano();
        });
        
        document.getElementById('minimizeMac').addEventListener('click', () => {
            this.minimizePiano();
        });
        
        document.getElementById('maximizeMac').addEventListener('click', () => {
            this.maximizePiano();
        });
        
        
        // Piano icon - restores the piano window
        document.getElementById('pianoIcon').addEventListener('click', () => {
            this.restorePiano();
        });
        
        // Recording controls
        document.getElementById('recordButton').addEventListener('click', () => {
            this.toggleRecording();
        });
        
        document.getElementById('playButton').addEventListener('click', () => {
            this.playRecording();
        });
        
        // Volume control
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            this.masterVolume = e.target.value / 100;
            document.getElementById('volumeDisplay').textContent = `${e.target.value}%`;
        });
        
        // Octave controls
        document.getElementById('octaveDown').addEventListener('click', () => {
            if (this.currentOctave > 1) {
                this.currentOctave--;
                this.updateOctaveDisplay();
            }
        });
        
        document.getElementById('octaveUp').addEventListener('click', () => {
            if (this.currentOctave < 7) {
                this.currentOctave++;
                this.updateOctaveDisplay();
            }
        });
        
        // Sustain toggle
        document.getElementById('sustainToggle').addEventListener('click', () => {
            this.sustainMode = !this.sustainMode;
            const button = document.getElementById('sustainToggle');
            if (this.sustainMode) {
                button.textContent = 'ON';
                button.classList.add('active');
            } else {
                button.textContent = 'OFF';
                button.classList.remove('active');
                this.clearSustainedNotes();
            }
        });
        
        // Song controls (use onclick instead of addEventListener to avoid conflicts)
        document.getElementById('playFurElise').onclick = () => {
            console.log('Play Für Elise button clicked, button text:', document.getElementById('playFurElise').textContent);
            this.playSong('furElise');
        };
        
        // Set initial onclick handler for teach button (instead of addEventListener to avoid conflicts)
        document.getElementById('teachFurElise').onclick = () => {
            console.log('Teach button clicked, button text:', document.getElementById('teachFurElise').textContent);
            this.startTeaching('furElise');
        };
        
        // Instrument selector
        document.getElementById('instrumentSelect').addEventListener('change', (e) => {
            this.currentInstrument = e.target.value;
            console.log('Instrument changed to:', this.currentInstrument);
        });
        
        // Computer keyboard input
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            this.handleKeyDown(e.code);
        });
        
        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e.code);
        });
        
        // Prevent context menu on piano keys
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('key')) {
                e.preventDefault();
            }
        });
    }
    
    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume audio context on user interaction (required by modern browsers)
            document.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
            
        } catch (error) {
            console.error('Audio initialization failed:', error);
            alert('Audio not supported in this browser');
        }
    }
    
    generateKeyboard() {
        const keyboard = document.getElementById('keyboard');
        keyboard.innerHTML = ''; // Clear existing keys
        keyboard.style.position = 'relative'; // Enable absolute positioning of children
        
        // White keys for 2 octaves: C D E F G A B C D E F G A B
        const whiteKeyData = [
            // First octave (octave 0)
            {note: 'C', octave: 0, position: 0},
            {note: 'D', octave: 0, position: 1}, 
            {note: 'E', octave: 0, position: 2},
            {note: 'F', octave: 0, position: 3},
            {note: 'G', octave: 0, position: 4},
            {note: 'A', octave: 0, position: 5},
            {note: 'B', octave: 0, position: 6},
            // Second octave (octave 1)
            {note: 'C', octave: 1, position: 7},
            {note: 'D', octave: 1, position: 8},
            {note: 'E', octave: 1, position: 9},
            {note: 'F', octave: 1, position: 10},
            {note: 'G', octave: 1, position: 11},
            {note: 'A', octave: 1, position: 12},
            {note: 'B', octave: 1, position: 13}
        ];

        // Create white keys first and measure their width
        let whiteKeyWidth = 60; // Default width
        whiteKeyData.forEach(({note, octave, position}, index) => {
            const key = this.createKey(note, octave, false);
            key.style.position = 'absolute';
            keyboard.appendChild(key);
            
            // Measure the first white key to get actual width for responsive design
            if (index === 0) {
                whiteKeyWidth = key.offsetWidth;
            }
            
            key.style.left = `${position * whiteKeyWidth}px`;
        });
        
        // Black keys positioned to overlap white keys (half on each adjacent key)
        const blackKeyData = [
            // First octave - Group of 2: C# D#
            {note: 'C#', octave: 0, whiteKeyIndex: 1.0},   // Half on C(0), half on D(1) - centered at boundary
            {note: 'D#', octave: 0, whiteKeyIndex: 2.0},   // Half on D(1), half on E(2) - centered at boundary
            // Gap between E and F
            // Group of 3: F# G# A#  
            {note: 'F#', octave: 0, whiteKeyIndex: 4.0},   // Half on F(3), half on G(4) - centered at boundary
            {note: 'G#', octave: 0, whiteKeyIndex: 5.0},   // Half on G(4), half on A(5) - centered at boundary
            {note: 'A#', octave: 0, whiteKeyIndex: 6.0},   // Half on A(5), half on B(6) - centered at boundary
            
            // Second octave - Group of 2: C# D#
            {note: 'C#', octave: 1, whiteKeyIndex: 8.0},   // Half on C(7), half on D(8) - centered at boundary
            {note: 'D#', octave: 1, whiteKeyIndex: 9.0},   // Half on D(8), half on E(9) - centered at boundary
            // Gap between E and F
            // Group of 3: F# G# A#
            {note: 'F#', octave: 1, whiteKeyIndex: 11.0},  // Half on F(10), half on G(11) - centered at boundary
            {note: 'G#', octave: 1, whiteKeyIndex: 12.0},  // Half on G(11), half on A(12) - centered at boundary
            {note: 'A#', octave: 1, whiteKeyIndex: 13.0}   // Half on A(12), half on B(13) - centered at boundary
        ];
        
        // Create black keys
        blackKeyData.forEach(({note, octave, whiteKeyIndex}) => {
            const blackKey = this.createKey(note, octave, true);
            blackKey.style.position = 'absolute';
            blackKey.style.zIndex = '2'; // Ensure black keys appear above white keys
            
            // Add to keyboard first so we can measure its actual width
            keyboard.appendChild(blackKey);
            
            // Get the actual computed width for responsive design
            const blackKeyWidth = blackKey.offsetWidth;
            
            // Position black key to overlap white keys (half on each adjacent white key)
            // whiteKeyIndex 0.5 means halfway between white key 0 and 1
            const centerPosition = whiteKeyIndex * whiteKeyWidth;
            const leftPosition = centerPosition - (blackKeyWidth / 2);
            blackKey.style.left = `${leftPosition}px`;
        });
    }
    
    createKey(note, octaveOffset, isBlack) {
        const key = document.createElement('div');
        key.className = `key ${isBlack ? 'black' : 'white'}`;
        key.dataset.note = note;
        key.dataset.octaveOffset = octaveOffset;
        
        // Add keyboard hint
        const keyHint = document.createElement('div');
        keyHint.className = 'key-label';
        const keyboardKey = this.getKeyboardKeyForNote(note, octaveOffset);
        if (keyboardKey) {
            keyHint.textContent = keyboardKey;
        }
        key.appendChild(keyHint);
        
        // Mouse events
        key.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (this.isTeaching && this.waitingForNote) {
                this.handleTeachingInput(note, octaveOffset);
            } else {
                this.playNote(note, octaveOffset);
                key.classList.add('active');
            }
        });
        
        key.addEventListener('mouseup', () => {
            if (!this.isTeaching) {
                this.stopNote(note, octaveOffset);
                key.classList.remove('active');
            }
        });
        
        key.addEventListener('mouseleave', () => {
            if (!this.isTeaching) {
                this.stopNote(note, octaveOffset);
                key.classList.remove('active');
            }
        });
        
        // Prevent drag
        key.addEventListener('dragstart', (e) => e.preventDefault());
        
        return key;
    }
    
    getKeyboardKeyForNote(note, octaveOffset) {
        // Find the computer key that maps to this specific note and octave
        for (const [keyCode, mapping] of Object.entries(this.keyboardMap)) {
            if (mapping.note === note && mapping.octaveOffset === octaveOffset) {
                // Convert keyCode to display format
                const keyDisplayMap = {
                    // White keys for 2 octaves: a, s, d, f, g, h, j, k, l, ;, ', \, z, x
                    'KeyA': 'A', 'KeyS': 'S', 'KeyD': 'D', 'KeyF': 'F', 'KeyG': 'G', 'KeyH': 'H', 'KeyJ': 'J',
                    'KeyK': 'K', 'KeyL': 'L', 'Semicolon': ';', 'Quote': "'", 'Backslash': '\\',
                    'KeyZ': 'Z', 'KeyX': 'X',
                    // Black keys for 2 octaves: w, e, t, y, u, i, o, p, [, ]
                    'KeyW': 'W', 'KeyE': 'E', 'KeyT': 'T', 'KeyY': 'Y', 'KeyU': 'U',
                    'KeyI': 'I', 'KeyO': 'O', 'KeyP': 'P', 'BracketLeft': '[', 'BracketRight': ']'
                };
                return keyDisplayMap[keyCode] || '';
            }
        }
        return '';
    }
    
    handleKeyDown(keyCode) {
        // Piano is always active now since there's no landing page
        const keyMapping = this.keyboardMap[keyCode];
        if (keyMapping) {
            // Check if we're in teaching mode
            if (this.isTeaching && this.waitingForNote) {
                this.handleTeachingInput(keyMapping.note, keyMapping.octaveOffset);
            } else {
                this.playNote(keyMapping.note, keyMapping.octaveOffset);
                this.highlightKey(keyMapping.note, keyMapping.octaveOffset, true);
            }
        }
    }
    
    handleKeyUp(keyCode) {
        // Piano is always active now since there's no landing page
        const keyMapping = this.keyboardMap[keyCode];
        if (keyMapping && !this.isTeaching) {
            // Only process key up events normally when not in teaching mode
            this.stopNote(keyMapping.note, keyMapping.octaveOffset);
            this.highlightKey(keyMapping.note, keyMapping.octaveOffset, false);
        }
    }
    
    highlightKey(note, octaveOffset, active) {
        const key = document.querySelector(`[data-note="${note}"][data-octave-offset="${octaveOffset}"]`);
        if (key) {
            if (active) {
                key.classList.add('active');
            } else {
                key.classList.remove('active');
            }
        }
    }
    
    playNote(note, octaveOffset = 0, fromPlayback = false) {
        if (!this.audioContext) return;
        
        const noteKey = `${note}_${octaveOffset}`;
        
        // Don't play the same note multiple times
        if (this.activeNotes.has(noteKey)) return;
        
        // Record note on event
        if (this.isRecording && !fromPlayback) {
            const timestamp = Date.now() - this.recordingStartTime;
            this.recordedSequence.push({
                type: 'noteOn',
                note: note,
                octaveOffset: octaveOffset,
                octave: this.currentOctave,
                timestamp: timestamp
            });
        }
        
        const frequency = this.getNoteFrequency(note, this.currentOctave + octaveOffset);
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Get instrument settings
        const instrumentSettings = this.getInstrumentSettings(this.currentInstrument);
        
        // Configure oscillator based on instrument
        oscillator.type = instrumentSettings.oscillatorType;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // Create envelope based on instrument settings
        const currentTime = this.audioContext.currentTime;
        const peakVolume = this.masterVolume * 0.3;
        const sustainVolume = this.masterVolume * instrumentSettings.sustain;
        
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(peakVolume, currentTime + instrumentSettings.attack);
        
        if (this.sustainMode) {
            // In sustain mode, hold at sustain level until manually released
            gainNode.gain.exponentialRampToValueAtTime(sustainVolume, currentTime + instrumentSettings.attack + instrumentSettings.decay);
        } else {
            // Natural decay without sustain - for piano, decay directly to silence
            if (this.currentInstrument === 'piano') {
                // Piano: direct decay to silence without sustain phase
                gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + instrumentSettings.attack + instrumentSettings.decay);
            } else {
                // Other instruments: brief sustain then release
                gainNode.gain.exponentialRampToValueAtTime(sustainVolume, currentTime + instrumentSettings.attack + instrumentSettings.decay);
                gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + instrumentSettings.attack + instrumentSettings.decay + instrumentSettings.release);
            }
        }
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        
        // If not in sustain mode, automatically stop the oscillator after natural decay
        if (!this.sustainMode) {
            let totalDecayTime;
            if (this.currentInstrument === 'piano') {
                // Piano decays directly without release phase
                totalDecayTime = instrumentSettings.attack + instrumentSettings.decay;
            } else {
                // Other instruments have full ADSR
                totalDecayTime = instrumentSettings.attack + instrumentSettings.decay + instrumentSettings.release;
            }
            oscillator.stop(this.audioContext.currentTime + totalDecayTime + 0.1); // Small buffer
            
            // Clean up from active notes when oscillator naturally ends
            oscillator.addEventListener('ended', () => {
                this.activeNotes.delete(noteKey);
            });
        }
        
        this.activeNotes.set(noteKey, { oscillator, gainNode });
        
        if (this.sustainMode) {
            this.sustainedNotes.add(noteKey);
        }
    }
    
    stopNote(note, octaveOffset = 0, fromPlayback = false) {
        const noteKey = `${note}_${octaveOffset}`;
        
        // Record note off event
        if (this.isRecording && !fromPlayback) {
            const timestamp = Date.now() - this.recordingStartTime;
            this.recordedSequence.push({
                type: 'noteOff',
                note: note,
                octaveOffset: octaveOffset,
                octave: this.currentOctave,
                timestamp: timestamp
            });
        }
        
        if (this.sustainMode && this.sustainedNotes.has(noteKey)) {
            return; // Keep sustained notes playing
        }
        
        if (this.activeNotes.has(noteKey)) {
            const { oscillator, gainNode } = this.activeNotes.get(noteKey);
            
            // Get instrument settings for release time
            const instrumentSettings = this.getInstrumentSettings(this.currentInstrument);
            
            // Fade out based on instrument release time
            gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + instrumentSettings.release);
            
            oscillator.stop(this.audioContext.currentTime + instrumentSettings.release);
            
            this.activeNotes.delete(noteKey);
        }
    }
    
    clearSustainedNotes() {
        this.sustainedNotes.forEach(noteKey => {
            if (this.activeNotes.has(noteKey)) {
                const { oscillator, gainNode } = this.activeNotes.get(noteKey);
                gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.2);
                oscillator.stop(this.audioContext.currentTime + 0.2);
                this.activeNotes.delete(noteKey);
            }
        });
        this.sustainedNotes.clear();
    }
    
    getNoteFrequency(note, octave) {
        const baseFreq = this.noteFrequencies[note];
        return baseFreq * Math.pow(2, octave - 4);
    }
    
    getInstrumentSettings(instrumentType) {
        const instruments = {
            piano: {
                oscillatorType: 'triangle',
                attack: 0.01,
                decay: 0.8,
                sustain: 0.02,
                release: 0.4
            },
            electric: {
                oscillatorType: 'sawtooth',
                attack: 0.02,
                decay: 0.2,
                sustain: 0.25,
                release: 0.6
            },
            organ: {
                oscillatorType: 'sine',
                attack: 0.001,
                decay: 0.1,
                sustain: 0.8,
                release: 0.2
            },
            synthesizer: {
                oscillatorType: 'square',
                attack: 0.05,
                decay: 0.1,
                sustain: 0.7,
                release: 0.3
            },
            harpsichord: {
                oscillatorType: 'sawtooth',
                attack: 0.001,
                decay: 0.8,
                sustain: 0.05,
                release: 0.3
            },
            marimba: {
                oscillatorType: 'sine',
                attack: 0.02,
                decay: 1.0,
                sustain: 0.1,
                release: 1.5
            }
        };
        
        return instruments[instrumentType] || instruments.piano;
    }
    
    updateOctaveDisplay() {
        document.getElementById('octaveDisplay').textContent = this.currentOctave;
    }
    
    minimizePiano() {
        // Minimize the piano window and stop all active notes
        document.getElementById('pianoWindow').classList.add('hidden');
        document.getElementById('pianoIcon').classList.remove('hidden');
        
        // Stop all active notes
        this.activeNotes.forEach(({ oscillator, gainNode }) => {
            gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime);
        });
        this.activeNotes.clear();
        this.sustainedNotes.clear();
        
        // Stop any ongoing recording, playback, song, or teaching
        if (this.isRecording) {
            this.stopRecording();
        }
        if (this.isPlaying) {
            this.stopPlayback();
        }
        if (this.isPlayingSong) {
            this.stopSong();
        }
        if (this.isTeaching) {
            this.stopTeaching();
        }
    }
    
    restorePiano() {
        // Restore the piano window and hide the desktop icon
        document.getElementById('pianoWindow').classList.remove('hidden');
        document.getElementById('pianoIcon').classList.add('hidden');
        
        // Resume audio context if needed
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    closePiano() {
        // Actually close/hide the piano completely
        this.clearAllActiveNotes();
        
        // Stop all ongoing operations
        if (this.isRecording) this.stopRecording();
        if (this.isPlaying) this.stopPlayback();
        if (this.isPlayingSong) this.stopSong();
        if (this.isTeaching) this.stopTeaching();
        
        // Hide the piano window and show desktop icon
        document.getElementById('pianoWindow').classList.add('hidden');
        document.getElementById('pianoIcon').classList.remove('hidden');
        
        console.log('Piano closed');
    }
    
    maximizePiano() {
        // Toggle window size between normal and maximized
        const pianoWindow = document.getElementById('pianoWindow');
        
        if (pianoWindow.classList.contains('maximized')) {
            pianoWindow.classList.remove('maximized');
            console.log('Piano window restored to normal size');
        } else {
            pianoWindow.classList.add('maximized');
            console.log('Piano window maximized');
        }
    }
    
    // Recording functionality
    toggleRecording() {
        if (this.isPlaying) {
            return; // Don't allow recording while playing
        }
        
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }
    
    startRecording() {
        this.isRecording = true;
        this.recordedSequence = [];
        this.recordingStartTime = Date.now();
        
        const recordButton = document.getElementById('recordButton');
        const playButton = document.getElementById('playButton');
        const statusElement = document.getElementById('recordingStatus');
        
        recordButton.classList.add('recording');
        recordButton.innerHTML = '<span class="record-icon">●</span> Stop';
        playButton.disabled = true;
        statusElement.textContent = 'Recording...';
    }
    
    stopRecording() {
        this.isRecording = false;
        
        const recordButton = document.getElementById('recordButton');
        const playButton = document.getElementById('playButton');
        const statusElement = document.getElementById('recordingStatus');
        
        recordButton.classList.remove('recording');
        recordButton.innerHTML = '<span class="record-icon">●</span> Record';
        playButton.disabled = this.recordedSequence.length === 0;
        
        const duration = this.recordedSequence.length > 0 ? 
            (this.recordedSequence[this.recordedSequence.length - 1].timestamp / 1000).toFixed(1) : 0;
        statusElement.textContent = this.recordedSequence.length > 0 ? 
            `Recorded: ${this.recordedSequence.filter(e => e.type === 'noteOn').length} notes (${duration}s)` : '';
    }
    
    playRecording() {
        if (this.isRecording || this.isPlaying || this.recordedSequence.length === 0) {
            return;
        }
        
        this.isPlaying = true;
        const recordButton = document.getElementById('recordButton');
        const playButton = document.getElementById('playButton');
        const statusElement = document.getElementById('recordingStatus');
        
        recordButton.disabled = true;
        playButton.innerHTML = '<span class="play-icon">■</span> Stop';
        playButton.onclick = () => this.stopPlayback();
        statusElement.textContent = 'Playing...';
        
        let eventIndex = 0;
        const startTime = Date.now();
        
        const playNextEvent = () => {
            if (!this.isPlaying || eventIndex >= this.recordedSequence.length) {
                this.stopPlayback();
                return;
            }
            
            const event = this.recordedSequence[eventIndex];
            const expectedTime = startTime + event.timestamp;
            const currentTime = Date.now();
            const delay = expectedTime - currentTime;
            
            if (delay > 0) {
                this.playbackTimer = setTimeout(() => {
                    this.executePlaybackEvent(event);
                    eventIndex++;
                    playNextEvent();
                }, delay);
            } else {
                this.executePlaybackEvent(event);
                eventIndex++;
                setTimeout(playNextEvent, 0);
            }
        };
        
        playNextEvent();
    }
    
    executePlaybackEvent(event) {
        // Save current octave and set to recorded octave
        const originalOctave = this.currentOctave;
        this.currentOctave = event.octave;
        
        if (event.type === 'noteOn') {
            this.playNote(event.note, event.octaveOffset, true);
            this.highlightKey(event.note, event.octaveOffset, true);
        } else if (event.type === 'noteOff') {
            this.stopNote(event.note, event.octaveOffset, true);
            this.highlightKey(event.note, event.octaveOffset, false);
        }
        
        // Restore current octave
        this.currentOctave = originalOctave;
    }
    
    stopPlayback() {
        this.isPlaying = false;
        
        if (this.playbackTimer) {
            clearTimeout(this.playbackTimer);
            this.playbackTimer = null;
        }
        
        const recordButton = document.getElementById('recordButton');
        const playButton = document.getElementById('playButton');
        const statusElement = document.getElementById('recordingStatus');
        
        recordButton.disabled = false;
        playButton.innerHTML = '<span class="play-icon">▶</span> Play';
        playButton.onclick = () => this.playRecording();
        
        const duration = this.recordedSequence.length > 0 ? 
            (this.recordedSequence[this.recordedSequence.length - 1].timestamp / 1000).toFixed(1) : 0;
        statusElement.textContent = this.recordedSequence.length > 0 ? 
            `Recorded: ${this.recordedSequence.filter(e => e.type === 'noteOn').length} notes (${duration}s)` : '';
        
        // Clear all active visual highlights
        document.querySelectorAll('.key.active').forEach(key => {
            key.classList.remove('active');
        });
    }
    
    // Song autoplay functionality
    playSong(songKey) {
        console.log('playSong called, current state:', this.isPlayingSong);
        if (this.isPlayingSong || this.isRecording || this.isPlaying) {
            if (this.isPlayingSong) {
                this.stopSong();
                return; // Don't start playing again immediately
            }
            return;
        }
        
        const song = this.songs[songKey];
        if (!song) {
            console.error(`Song ${songKey} not found`);
            return;
        }
        
        this.isPlayingSong = true;
        this.currentSong = songKey;
        
        const songButton = document.getElementById('playFurElise');
        const statusElement = document.getElementById('songStatus');
        const recordButton = document.getElementById('recordButton');
        const playButton = document.getElementById('playButton');
        
        // Update UI
        songButton.classList.add('playing');
        songButton.textContent = 'Stop Song';
        songButton.onclick = () => {
            console.log('Stop Song button clicked');
            this.stopSong();
        };
        statusElement.textContent = `Playing: ${song.name}`;
        recordButton.disabled = true;
        playButton.disabled = true;
        
        // Play the song
        let noteIndex = 0;
        const playNextNote = () => {
            if (!this.isPlayingSong || noteIndex >= song.notes.length) {
                this.stopSong();
                return;
            }
            
            const noteData = song.notes[noteIndex];
            const currentTime = Date.now();
            
            if (noteData.note === 'REST') {
                // Rest/pause - just wait
                noteIndex++;
                this.songTimer = setTimeout(playNextNote, noteData.duration);
                return;
            }
            
            // Play the note
            this.playNote(noteData.note, noteData.octaveOffset, true);
            this.highlightKey(noteData.note, noteData.octaveOffset, true);
            
            // Schedule note off
            setTimeout(() => {
                if (this.isPlayingSong) {
                    this.stopNote(noteData.note, noteData.octaveOffset, true);
                    this.highlightKey(noteData.note, noteData.octaveOffset, false);
                }
            }, noteData.duration);
            
            noteIndex++;
            
            // Schedule next note
            const nextNote = song.notes[noteIndex];
            if (nextNote) {
                const delay = nextNote.delay - noteData.delay;
                this.songTimer = setTimeout(playNextNote, delay);
            } else {
                // Song finished
                setTimeout(() => this.stopSong(), noteData.duration);
            }
        };
        
        playNextNote();
    }
    
    stopSong() {
        console.log('stopSong called, current state:', this.isPlayingSong);
        this.isPlayingSong = false;
        
        if (this.songTimer) {
            clearTimeout(this.songTimer);
            this.songTimer = null;
        }
        
        const songButton = document.getElementById('playFurElise');
        const statusElement = document.getElementById('songStatus');
        const recordButton = document.getElementById('recordButton');
        const playButton = document.getElementById('playButton');
        
        // Reset UI
        songButton.classList.remove('playing');
        songButton.textContent = 'Play Für Elise';
        songButton.onclick = () => {
            console.log('Play Für Elise button clicked (after reset)');
            this.playSong('furElise');
        };
        statusElement.textContent = '';
        recordButton.disabled = false;
        playButton.disabled = this.recordedSequence.length === 0;
        
        // Clear all visual highlights
        document.querySelectorAll('.key.active').forEach(key => {
            key.classList.remove('active');
        });
        
        // Stop all active notes
        this.activeNotes.forEach(({ oscillator, gainNode }) => {
            gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime);
        });
        this.activeNotes.clear();
        this.sustainedNotes.clear();
        
        this.currentSong = null;
    }
    
    // Teaching functionality
    startTeaching(songKey) {
        console.log('startTeaching called, current state:', this.isTeaching);
        if (this.isTeaching || this.isRecording || this.isPlaying || this.isPlayingSong) {
            if (this.isTeaching) {
                this.stopTeaching();
                return; // Don't start teaching again immediately
            }
            return;
        }
        
        const song = this.songs[songKey];
        if (!song) {
            console.error(`Song ${songKey} not found`);
            return;
        }
        
        // Filter out REST notes for teaching
        const musicNotes = song.notes.filter(note => note.note !== 'REST');
        
        // Clear any existing teaching timeouts
        this.teachingTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        this.teachingTimeouts = [];
        
        this.isTeaching = true;
        this.teachingSong = musicNotes;
        this.currentNoteIndex = 0;
        this.waitingForNote = true;
        
        const teachButton = document.getElementById('teachFurElise');
        const songButton = document.getElementById('playFurElise');
        const statusElement = document.getElementById('songStatus');
        const recordButton = document.getElementById('recordButton');
        const playButton = document.getElementById('playButton');
        
        // Update UI - change button text and add visual indicator
        teachButton.classList.add('teaching');
        teachButton.textContent = 'Stop Teaching';
        teachButton.onclick = () => {
            console.log('Stop Teaching button clicked');
            this.stopTeaching();
        };
        songButton.disabled = true;
        recordButton.disabled = true;
        playButton.disabled = true;
        statusElement.textContent = ''; // Clear song status during teaching
        
        // Show tutorial message
        const tutorialMessage = document.getElementById('tutorialMessage');
        tutorialMessage.style.display = 'block';
        tutorialMessage.textContent = `🎓 Teaching Mode Active - Press the glowing keys to learn ${song.name}!`;
        
        // Clear any active notes before starting
        this.clearAllActiveNotes();
        
        // Show the first note
        this.showNextNote();
    }
    
    stopTeaching() {
        console.log('stopTeaching called, current state:', this.isTeaching);
        this.isTeaching = false;
        this.waitingForNote = false;
        
        // Clear all teaching-related timeouts to prevent delayed effects
        this.teachingTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        this.teachingTimeouts = [];
        
        const teachButton = document.getElementById('teachFurElise');
        const songButton = document.getElementById('playFurElise');
        const statusElement = document.getElementById('songStatus');
        const recordButton = document.getElementById('recordButton');
        const playButton = document.getElementById('playButton');
        
        // Reset UI
        teachButton.classList.remove('teaching');
        teachButton.textContent = 'Teach me';
        teachButton.onclick = () => {
            console.log('Teach me button clicked');
            this.startTeaching('furElise');
        };
        songButton.disabled = false;
        recordButton.disabled = false;
        playButton.disabled = this.recordedSequence.length === 0;
        statusElement.textContent = '';
        
        // Hide tutorial message
        const tutorialMessage = document.getElementById('tutorialMessage');
        tutorialMessage.style.display = 'none';
        tutorialMessage.textContent = '';
        
        // Clear visual indicators and any active notes
        this.clearVisualIndicators();
        this.clearAllActiveNotes();
        
        this.teachingSong = null;
        this.currentNoteIndex = 0;
    }
    
    showNextNote() {
        if (!this.isTeaching || !this.teachingSong || this.currentNoteIndex >= this.teachingSong.length) {
            return;
        }
        
        const currentNote = this.teachingSong[this.currentNoteIndex];
        const targetKey = document.querySelector(`[data-note="${currentNote.note}"][data-octave-offset="${currentNote.octaveOffset}"]`);
        
        if (targetKey) {
            // Clear any existing indicators
            this.clearVisualIndicators();
            
            // Add glow effect to target key
            targetKey.classList.add('next-key');
            
            // Add falling light effect
            this.addFallingLight(targetKey);
            
            // Update tutorial message
            const tutorialMessage = document.getElementById('tutorialMessage');
            const totalNotes = this.teachingSong.length;
            const currentNum = this.currentNoteIndex + 1;
            tutorialMessage.textContent = `🎹 Note ${currentNum} of ${totalNotes} - Press the glowing ${currentNote.note} key!`;
        }
    }
    
    addFallingLight(targetKey) {
        const light = document.createElement('div');
        light.classList.add('falling-light');
        targetKey.appendChild(light);
        
        // Remove the light after animation completes
        setTimeout(() => {
            if (light.parentNode) {
                light.parentNode.removeChild(light);
            }
        }, 2000);
        
        // Add another falling light every 2 seconds while waiting
        if (this.waitingForNote && this.isTeaching) {
            const timeoutId = setTimeout(() => {
                if (this.waitingForNote && this.isTeaching && targetKey.classList.contains('next-key')) {
                    this.addFallingLight(targetKey);
                }
            }, 2000);
            this.teachingTimeouts.push(timeoutId);
        }
    }
    
    handleTeachingInput(note, octaveOffset) {
        if (!this.isTeaching || !this.waitingForNote || !this.teachingSong) {
            return;
        }
        
        const currentNote = this.teachingSong[this.currentNoteIndex];
        const targetKey = document.querySelector(`[data-note="${currentNote.note}"][data-octave-offset="${currentNote.octaveOffset}"]`);
        const pressedKey = document.querySelector(`[data-note="${note}"][data-octave-offset="${octaveOffset}"]`);
        
        if (currentNote.note === note && currentNote.octaveOffset === octaveOffset) {
            // Correct note pressed
            this.playNote(note, octaveOffset);
            
            // Stop the note after a short duration to prevent sustaining
            setTimeout(() => {
                this.stopNote(note, octaveOffset);
            }, 600);
            
            if (pressedKey) {
                pressedKey.classList.add('correct');
                setTimeout(() => pressedKey.classList.remove('correct'), 300);
            }
            
            // Move to next note
            this.currentNoteIndex++;
            
            if (this.currentNoteIndex >= this.teachingSong.length) {
                // Song completed
                const tutorialMessage = document.getElementById('tutorialMessage');
                tutorialMessage.textContent = '🎉 Congratulations! You completed Für Elise! Well done! 🎵';
                const timeoutId = setTimeout(() => this.stopTeaching(), 3000);
                this.teachingTimeouts.push(timeoutId);
            } else {
                // Show next note after a brief pause
                const timeoutId = setTimeout(() => this.showNextNote(), 800);
                this.teachingTimeouts.push(timeoutId);
            }
        } else {
            // Wrong note pressed
            this.playNote(note, octaveOffset);
            
            // Stop the wrong note after a short duration
            setTimeout(() => {
                this.stopNote(note, octaveOffset);
            }, 400);
            
            if (pressedKey) {
                pressedKey.classList.add('wrong');
                setTimeout(() => pressedKey.classList.remove('wrong'), 500);
            }
            
            // Give feedback in tutorial message
            const tutorialMessage = document.getElementById('tutorialMessage');
            tutorialMessage.textContent = `❌ Wrong key! Try again - Press the glowing key!`;
            const timeoutId = setTimeout(() => {
                if (this.isTeaching) {
                    const totalNotes = this.teachingSong.length;
                    const currentNum = this.currentNoteIndex + 1;
                    const currentNote = this.teachingSong[this.currentNoteIndex];
                    tutorialMessage.textContent = `🎹 Note ${currentNum} of ${totalNotes} - Press the glowing ${currentNote.note} key!`;
                }
            }, 1500);
            this.teachingTimeouts.push(timeoutId);
        }
    }
    
    clearVisualIndicators() {
        // Remove all visual teaching indicators
        document.querySelectorAll('.key').forEach(key => {
            key.classList.remove('next-key', 'correct', 'wrong');
        });
        
        // Remove all falling lights
        document.querySelectorAll('.falling-light').forEach(light => {
            if (light.parentNode) {
                light.parentNode.removeChild(light);
            }
        });
    }
    
    clearAllActiveNotes() {
        // Stop all currently playing notes to prevent sustaining sounds
        this.activeNotes.forEach(({ oscillator, gainNode }) => {
            gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime);
        });
        this.activeNotes.clear();
        this.sustainedNotes.clear();
        
        // Also clear any visual key highlights
        document.querySelectorAll('.key.active').forEach(key => {
            key.classList.remove('active');
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MacPiano();
});

// Add some classic Mac-style interactions
document.addEventListener('DOMContentLoaded', () => {
    
    // Make windows draggable (basic implementation)
    const windows = document.querySelectorAll('.window');
    windows.forEach(window => {
        const titleBar = window.querySelector('.title-bar');
        let isDragging = false;
        let currentX = 0;
        let currentY = 0;
        let initialX = 0;
        let initialY = 0;
        
        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('window-button')) return;
            
            isDragging = true;
            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
            
            titleBar.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                window.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                titleBar.style.cursor = '';
            }
        });
    });
});
