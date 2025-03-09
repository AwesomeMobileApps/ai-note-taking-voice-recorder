import Foundation
import WatchConnectivity

@objc(RNWatchConnectivity)
class RNWatchConnectivity: NSObject, WCSessionDelegate {
  
  // The React Native event emitter
  private var eventEmitter: RCTEventEmitter?
  
  // Singleton instance
  static let shared = RNWatchConnectivity()
  
  // WCSession instance
  private var session: WCSession?
  
  // Private initializer for singleton
  private override init() {
    super.init()
    
    // Initialize WCSession if supported
    if WCSession.isSupported() {
      session = WCSession.default
      session?.delegate = self
      session?.activate()
    }
  }
  
  // Set the event emitter
  @objc func setEventEmitter(_ emitter: RCTEventEmitter) {
    eventEmitter = emitter
  }
  
  // Check if the watch is reachable
  @objc func isReachable(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    guard let session = session else {
      resolve(false)
      return
    }
    
    resolve(session.isReachable)
  }
  
  // Send a message to the watch
  @objc func sendMessage(_ message: [String: Any], resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let session = session, session.isReachable else {
      reject("ERROR", "Watch is not reachable", nil)
      return
    }
    
    session.sendMessage(message, replyHandler: { reply in
      resolve(reply)
    }, errorHandler: { error in
      reject("ERROR", error.localizedDescription, error)
    })
  }
  
  // MARK: - WCSessionDelegate
  
  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    if let error = error {
      print("WCSession activation failed with error: \(error.localizedDescription)")
      return
    }
    
    // Emit session activated event
    DispatchQueue.main.async {
      self.eventEmitter?.sendEvent(withName: "sessionActivated", body: nil)
    }
  }
  
  func sessionDidBecomeInactive(_ session: WCSession) {
    // Handle session becoming inactive
  }
  
  func sessionDidDeactivate(_ session: WCSession) {
    // Reactivate session if needed
    session.activate()
  }
  
  func sessionReachabilityDidChange(_ session: WCSession) {
    // Emit reachability changed event
    DispatchQueue.main.async {
      self.eventEmitter?.sendEvent(withName: "reachabilityChanged", body: session.isReachable)
    }
  }
  
  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    // Handle received message
    if let type = message["type"] as? String, type == "newNote" {
      let noteData: [String: Any] = [
        "title": message["title"] as? String ?? "Untitled Note",
        "content": message["content"] as? String ?? "",
        "timestamp": message["timestamp"] as? Double ?? Date().timeIntervalSince1970
      ]
      
      // Emit note received event
      DispatchQueue.main.async {
        self.eventEmitter?.sendEvent(withName: "noteReceived", body: noteData)
      }
    }
  }
  
  func session(_ session: WCSession, didReceiveMessage message: [String: Any], replyHandler: @escaping ([String: Any]) -> Void) {
    // Handle received message with reply
    if let type = message["type"] as? String, type == "newNote" {
      let noteData: [String: Any] = [
        "title": message["title"] as? String ?? "Untitled Note",
        "content": message["content"] as? String ?? "",
        "timestamp": message["timestamp"] as? Double ?? Date().timeIntervalSince1970
      ]
      
      // Emit note received event
      DispatchQueue.main.async {
        self.eventEmitter?.sendEvent(withName: "noteReceived", body: noteData)
      }
      
      // Send reply
      replyHandler(["status": "received"])
    } else {
      replyHandler(["status": "unknown message type"])
    }
  }
} 