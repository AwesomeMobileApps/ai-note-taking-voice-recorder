import WatchKit
import WatchConnectivity

class ExtensionDelegate: NSObject, WKExtensionDelegate {
    
    // Initialize WCSession for communication with iPhone
    func applicationDidFinishLaunching() {
        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = SessionDelegate.shared
            session.activate()
        }
    }
    
    func applicationDidBecomeActive() {
        // Restart any tasks that were paused (or not yet started) while the application was inactive.
    }
    
    func applicationWillResignActive() {
        // Sent when the application is about to move from active to inactive state.
        // This can occur for certain types of temporary interruptions or when the user quits the application.
    }
    
    func handle(_ backgroundTasks: Set<WKRefreshBackgroundTask>) {
        // Handle background tasks
        for task in backgroundTasks {
            // Process background task
            task.setTaskCompletedWithSnapshot(false)
        }
    }
}

// Singleton class to handle WCSession communication
class SessionDelegate: NSObject, WCSessionDelegate {
    
    static let shared = SessionDelegate()
    
    private override init() {
        super.init()
    }
    
    // Required WCSessionDelegate methods
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        if let error = error {
            print("WCSession activation failed with error: \(error.localizedDescription)")
            return
        }
        print("WCSession activated with state: \(activationState.rawValue)")
    }
    
    // Send note data to iPhone
    func sendNoteToPhone(title: String, content: String) {
        guard WCSession.default.isReachable else {
            print("iPhone is not reachable")
            return
        }
        
        let noteData: [String: Any] = [
            "type": "newNote",
            "title": title,
            "content": content,
            "timestamp": Date().timeIntervalSince1970
        ]
        
        WCSession.default.sendMessage(noteData, replyHandler: { reply in
            print("Message sent successfully: \(reply)")
        }, errorHandler: { error in
            print("Error sending message: \(error.localizedDescription)")
        })
    }
} 