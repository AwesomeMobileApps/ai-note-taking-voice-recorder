import ClockKit
import WatchKit

class ComplicationController: NSObject, CLKComplicationDataSource {
    
    // MARK: - Complication Configuration
    
    func getComplicationDescriptors(handler: @escaping ([CLKComplicationDescriptor]) -> Void) {
        let descriptors = [
            CLKComplicationDescriptor(
                identifier: "com.hermitweekend.notes",
                displayName: "Hermit Weekend",
                supportedFamilies: [
                    .modularSmall,
                    .modularLarge,
                    .utilitarianSmall,
                    .utilitarianLarge,
                    .circularSmall,
                    .graphicCorner,
                    .graphicCircular,
                    .graphicRectangular
                ]
            )
        ]
        
        // Call the handler with the array of descriptors
        handler(descriptors)
    }
    
    func handleSharedComplicationDescriptors(_ complicationDescriptors: [CLKComplicationDescriptor]) {
        // Do any necessary work to support these newly shared complication descriptors
    }
    
    // MARK: - Timeline Configuration
    
    func getTimelineEndDate(for complication: CLKComplication, withHandler handler: @escaping (Date?) -> Void) {
        // Call the handler with the last entry date you can currently provide or nil if you can't support future timelines
        handler(nil)
    }
    
    func getPrivacyBehavior(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationPrivacyBehavior) -> Void) {
        // Call the handler with your desired behavior when the device is locked
        handler(.showOnLockScreen)
    }
    
    // MARK: - Timeline Population
    
    func getCurrentTimelineEntry(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationTimelineEntry?) -> Void) {
        // Get the current note count from UserDefaults
        let noteCount = UserDefaults.standard.integer(forKey: "HermitWeekendNoteCount")
        
        // Create a template based on the complication family
        if let template = createTemplate(for: complication.family, noteCount: noteCount) {
            // Create a timeline entry for the current time
            let entry = CLKComplicationTimelineEntry(date: Date(), complicationTemplate: template)
            handler(entry)
        } else {
            handler(nil)
        }
    }
    
    func getTimelineEntries(for complication: CLKComplication, after date: Date, limit: Int, withHandler handler: @escaping ([CLKComplicationTimelineEntry]?) -> Void) {
        // Call the handler with the timeline entries after the given date
        handler(nil)
    }
    
    // MARK: - Sample Templates
    
    func getLocalizableSampleTemplate(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationTemplate?) -> Void) {
        // Create a template with sample data
        let template = createTemplate(for: complication.family, noteCount: 5)
        handler(template)
    }
    
    // MARK: - Helper Methods
    
    private func createTemplate(for family: CLKComplicationFamily, noteCount: Int) -> CLKComplicationTemplate? {
        // Create different templates based on the complication family
        switch family {
        case .modularSmall:
            let template = CLKComplicationTemplateModularSmallStackText()
            template.line1TextProvider = CLKSimpleTextProvider(text: "Notes")
            template.line2TextProvider = CLKSimpleTextProvider(text: "\(noteCount)")
            return template
            
        case .modularLarge:
            let template = CLKComplicationTemplateModularLargeStandardBody()
            template.headerTextProvider = CLKSimpleTextProvider(text: "Hermit Weekend")
            template.body1TextProvider = CLKSimpleTextProvider(text: "\(noteCount) Notes")
            return template
            
        case .utilitarianSmall:
            let template = CLKComplicationTemplateUtilitarianSmallFlat()
            template.textProvider = CLKSimpleTextProvider(text: "\(noteCount)")
            return template
            
        case .utilitarianLarge:
            let template = CLKComplicationTemplateUtilitarianLargeFlat()
            template.textProvider = CLKSimpleTextProvider(text: "Hermit: \(noteCount) Notes")
            return template
            
        case .circularSmall:
            let template = CLKComplicationTemplateCircularSmallStackText()
            template.line1TextProvider = CLKSimpleTextProvider(text: "HW")
            template.line2TextProvider = CLKSimpleTextProvider(text: "\(noteCount)")
            return template
            
        case .graphicCorner:
            let template = CLKComplicationTemplateGraphicCornerStackText()
            template.innerTextProvider = CLKSimpleTextProvider(text: "Notes")
            template.outerTextProvider = CLKSimpleTextProvider(text: "\(noteCount)")
            return template
            
        case .graphicCircular:
            let template = CLKComplicationTemplateGraphicCircularStackText()
            template.line1TextProvider = CLKSimpleTextProvider(text: "HW")
            template.line2TextProvider = CLKSimpleTextProvider(text: "\(noteCount)")
            return template
            
        case .graphicRectangular:
            let template = CLKComplicationTemplateGraphicRectangularStandardBody()
            template.headerTextProvider = CLKSimpleTextProvider(text: "Hermit Weekend")
            template.body1TextProvider = CLKSimpleTextProvider(text: "You have \(noteCount) notes")
            return template
            
        default:
            return nil
        }
    }
    
    // MARK: - Update Note Count
    
    // Call this method when a new note is created or synced
    func updateNoteCount(_ count: Int) {
        UserDefaults.standard.set(count, forKey: "HermitWeekendNoteCount")
        
        // Request an update for all active complications
        let server = CLKComplicationServer.sharedInstance()
        for complication in server.activeComplications ?? [] {
            server.reloadTimeline(for: complication)
        }
    }
} 