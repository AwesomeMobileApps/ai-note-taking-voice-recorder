#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RNWatchConnectivity, RCTEventEmitter)

RCT_EXTERN_METHOD(setEventEmitter:(RCTEventEmitter *)emitter)

RCT_EXTERN_METHOD(isReachable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(sendMessage:(NSDictionary *)message
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Required for RCTEventEmitter
- (NSArray<NSString *> *)supportedEvents {
  return @[@"noteReceived", @"reachabilityChanged", @"sessionActivated"];
}

// Override to prevent automatic initialization
+ (BOOL)requiresMainQueueSetup {
  return YES;
}

@end 