import WatchKit
import Foundation
import Speech
import AVFoundation

class InterfaceController: WKInterfaceController, AVAudioRecorderDelegate, SFSpeechRecognizerDelegate {
    
    // UI Elements
    @IBOutlet weak var recordButton: WKInterfaceButton!
    @IBOutlet weak var statusLabel: WKInterfaceLabel!
    @IBOutlet weak var transcriptionLabel: WKInterfaceLabel!
    @IBOutlet weak var sendButton: WKInterfaceButton!
    
    // Audio recording properties
    private var audioRecorder: AVAudioRecorder?
    private var audioFileURL: URL?
    
    // Speech recognition properties
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    
    // Recording state
    private var isRecording = false
    private var transcription = ""
    
    override func awake(withContext context: Any?) {
        super.awake(withContext: context)
        
        // Configure interface objects
        setupUI()
        
        // Set up speech recognizer
        speechRecognizer?.delegate = self
        
        // Request authorization for speech recognition
        SFSpeechRecognizer.requestAuthorization { authStatus in
            OperationQueue.main.addOperation {
                switch authStatus {
                case .authorized:
                    self.recordButton.setEnabled(true)
                case .denied, .restricted, .notDetermined:
                    self.recordButton.setEnabled(false)
                    self.statusLabel.setText("Speech recognition not authorized")
                @unknown default:
                    self.recordButton.setEnabled(false)
                }
            }
        }
    }
    
    override func willActivate() {
        super.willActivate()
        // This method is called when the controller is about to be visible to the user
    }
    
    override func didDeactivate() {
        super.didDeactivate()
        // This method is called when the controller is no longer visible
    }
    
    // Set up the UI elements
    private func setupUI() {
        statusLabel.setText("Ready to record")
        transcriptionLabel.setText("Tap Record to start")
        sendButton.setEnabled(false)
    }
    
    // Handle record button tap
    @IBAction func recordButtonTapped() {
        if isRecording {
            stopRecording()
        } else {
            startRecording()
        }
    }
    
    // Handle send button tap
    @IBAction func sendButtonTapped() {
        // Show confirmation dialog
        let actions: [WKAlertAction] = [
            WKAlertAction(title: "Cancel", style: .cancel, handler: {}),
            WKAlertAction(title: "Send", style: .default, handler: {
                self.sendNoteToPhone()
            })
        ]
        
        presentAlert(withTitle: "Send Note", message: "Send this note to your iPhone?", preferredStyle: .alert, actions: actions)
    }
    
    // Start recording audio and transcribing
    private func startRecording() {
        // Set up audio session
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .default)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            statusLabel.setText("Audio session setup failed")
            return
        }
        
        // Create URL for audio file
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        audioFileURL = documentsPath.appendingPathComponent("recording.wav")
        
        // Configure audio settings
        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatLinearPCM),
            AVSampleRateKey: 16000.0,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]
        
        // Create and configure audio recorder
        do {
            audioRecorder = try AVAudioRecorder(url: audioFileURL!, settings: settings)
            audioRecorder?.delegate = self
            audioRecorder?.prepareToRecord()
        } catch {
            statusLabel.setText("Failed to create recorder")
            return
        }
        
        // Create recognition request
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        
        guard let recognitionRequest = recognitionRequest else {
            statusLabel.setText("Unable to create request")
            return
        }
        
        recognitionRequest.shouldReportPartialResults = true
        
        // Start recognition task
        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { result, error in
            if let result = result {
                self.transcription = result.bestTranscription.formattedString
                self.transcriptionLabel.setText(self.transcription)
            }
            
            if error != nil || (result?.isFinal ?? false) {
                self.audioRecorder?.stop()
                self.recognitionRequest = nil
                self.recognitionTask = nil
            }
        }
        
        // Start recording
        audioRecorder?.record()
        isRecording = true
        
        // Update UI
        statusLabel.setText("Recording...")
        recordButton.setTitle("Stop")
        sendButton.setEnabled(false)
    }
    
    // Stop recording and finalize transcription
    private func stopRecording() {
        // Stop recording
        audioRecorder?.stop()
        
        // End recognition task
        recognitionTask?.cancel()
        recognitionTask = nil
        recognitionRequest = nil
        
        // Update state
        isRecording = false
        
        // Update UI
        statusLabel.setText("Recording stopped")
        recordButton.setTitle("Record")
        sendButton.setEnabled(!transcription.isEmpty)
    }
    
    // Send the transcribed note to the iPhone app
    private func sendNoteToPhone() {
        guard !transcription.isEmpty else {
            statusLabel.setText("Nothing to send")
            return
        }
        
        // Generate a title from the first few words
        let words = transcription.split(separator: " ")
        let titleWords = words.prefix(3).joined(separator: " ")
        let title = titleWords + (words.count > 3 ? "..." : "")
        
        // Send the note via WatchConnectivity
        SessionDelegate.shared.sendNoteToPhone(title: title, content: transcription)
        
        // Update UI
        statusLabel.setText("Note sent to iPhone")
        
        // Reset for new recording
        transcription = ""
        transcriptionLabel.setText("Tap Record to start")
        sendButton.setEnabled(false)
    }
    
    // MARK: - AVAudioRecorderDelegate
    
    func audioRecorderDidFinishRecording(_ recorder: AVAudioRecorder, successfully flag: Bool) {
        if !flag {
            stopRecording()
            statusLabel.setText("Recording failed")
        }
    }
    
    // MARK: - SFSpeechRecognizerDelegate
    
    func speechRecognizer(_ speechRecognizer: SFSpeechRecognizer, availabilityDidChange available: Bool) {
        recordButton.setEnabled(available)
        statusLabel.setText(available ? "Ready to record" : "Speech recognition unavailable")
    }
} 