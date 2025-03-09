#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import <WatchConnectivity/WatchConnectivity.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, WCSessionDelegate>

@property (nonatomic, strong) UIWindow *window;

@end 