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
    private var recordingStartTime: Date?
    private var batteryCheckTimer: Timer?
    
    override func awake(withContext context: Any?) {
        super.awake(withContext: context)
        
        // Apply custom styling
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
        
        // Add haptic feedback when the app becomes active
        WKInterfaceDevice.current().play(.click)
    }
    
    override func didDeactivate() {
        super.didDeactivate()
        // This method is called when the controller is no longer visible
        
        // Stop any ongoing recording if the app is deactivated
        if isRecording {
            stopRecording()
        }
        
        // Invalidate battery check timer
        batteryCheckTimer?.invalidate()
    }
    
    // Set up the UI elements with enhanced styling
    private func setupUI() {
        // Configure status label
        statusLabel.setText("Ready to record")
        
        // Configure transcription label
        transcriptionLabel.setText("Tap Record to start")
        
        // Configure record button with custom styling
        recordButton.setBackgroundColor(UIColor(red: 0.38, green: 0, blue: 0.93, alpha: 1.0))
        recordButton.setCornerRadius(16.0)
        
        // Configure send button with custom styling
        sendButton.setBackgroundColor(UIColor(red: 0, green: 0.48, blue: 1.0, alpha: 1.0))
        sendButton.setCornerRadius(16.0)
        sendButton.setEnabled(false)
    }
    
    // Handle record button tap
    @IBAction func recordButtonTapped() {
        // Add haptic feedback
        WKInterfaceDevice.current().play(.click)
        
        if isRecording {
            stopRecording()
        } else {
            startRecording()
        }
    }
    
    // Handle send button tap
    @IBAction func sendButtonTapped() {
        // Add haptic feedback
        WKInterfaceDevice.current().play(.click)
        
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
        
        // Configure audio settings with battery optimization
        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatLinearPCM),
            AVSampleRateKey: 8000.0, // Lower sample rate for battery efficiency
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.medium.rawValue // Medium quality for battery efficiency
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
        recordingStartTime = Date()
        
        // Set up battery check timer
        batteryCheckTimer = Timer.scheduledTimer(timeInterval: 30.0, target: self, selector: #selector(checkBatteryAndRecordingLength), userInfo: nil, repeats: true)
        
        // Update UI
        statusLabel.setText("Recording...")
        recordButton.setTitle("Stop")
        recordButton.setBackgroundColor(UIColor(red: 0.95, green: 0.27, blue: 0.27, alpha: 1.0)) // Red for stop
        sendButton.setEnabled(false)
    }
    
    // Check battery level and recording length to optimize battery usage
    @objc private func checkBatteryAndRecordingLength() {
        // Check if recording has been going on for too long
        if let startTime = recordingStartTime, Date().timeIntervalSince(startTime) > 120 { // 2 minutes max
            stopRecording()
            statusLabel.setText("Recording stopped to save battery")
            
            // Add haptic feedback
            WKInterfaceDevice.current().play(.notification)
        }
        
        // Check if transcription is getting too long
        if transcription.count > 500 {
            stopRecording()
            statusLabel.setText("Recording paused - text limit reached")
            
            // Add haptic feedback
            WKInterfaceDevice.current().play(.notification)
        }
    }
    
    // Stop recording and finalize transcription
    private func stopRecording() {
        // Stop recording
        audioRecorder?.stop()
        
        // End recognition task
        recognitionTask?.cancel()
        recognitionTask = nil
        recognitionRequest = nil
        
        // Invalidate battery check timer
        batteryCheckTimer?.invalidate()
        
        // Update state
        isRecording = false
        
        // Update UI
        statusLabel.setText("Recording stopped")
        recordButton.setTitle("Record")
        recordButton.setBackgroundColor(UIColor(red: 0.38, green: 0, blue: 0.93, alpha: 1.0)) // Purple for record
        sendButton.setEnabled(!transcription.isEmpty)
        
        // Add haptic feedback
        WKInterfaceDevice.current().play(.success)
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
        
        // Add haptic feedback
        WKInterfaceDevice.current().play(.success)
        
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
            
            // Add haptic feedback for error
            WKInterfaceDevice.current().play(.failure)
        }
    }
    
    // MARK: - SFSpeechRecognizerDelegate
    
    func speechRecognizer(_ speechRecognizer: SFSpeechRecognizer, availabilityDidChange available: Bool) {
        recordButton.setEnabled(available)
        statusLabel.setText(available ? "Ready to record" : "Speech recognition unavailable")
    }
} 