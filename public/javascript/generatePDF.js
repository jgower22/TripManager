const PDFDocument = require('pdfkit');
const { DateTime } = require('luxon');

function generatePDF(trip, dataCallback, endCallback) {
    const doc = new PDFDocument();
    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    let titleFontSize = 25;
    let headerFontSize = 20;
    let subHeaderFontSize = 17;
    let textFontSize = 14;
    let bold = 'Times-Bold';
    let normal = 'Times-Roman';

    //Name, Location
    doc.font(bold)
        .fontSize(titleFontSize)
        .text(trip.name);
    doc.font(normal)
        .fontSize(subHeaderFontSize)
        .text('Location: ' + trip.location);

    //Format start/end dates
    const dateFormat = { 
        ...DateTime.DATE_FULL, 
        weekday: 'long' 
    }; 
    const startDate = DateTime.fromISO(trip.startDate); 
    const formattedStartDate = startDate.toLocaleString(dateFormat); 
    const endDate = DateTime.fromISO(trip.endDate); 
    const formattedEndDate = endDate.toLocaleString(dateFormat);

    //Start/end dates
    doc.font(normal)
        .fontSize(subHeaderFontSize)
        .text(formattedStartDate + ' - ' + formattedEndDate);

    //Description
    doc.text('\n');
    doc.font(bold)
        .fontSize(headerFontSize)
        .text('Description');

    doc.font(normal)
        .fontSize(textFontSize)
        .text(trip.details.replace(/\r\n|\r/g, '\n'));

    //Days
    doc.text('\n');
    doc.font(bold)
        .fontSize(headerFontSize)
        .text('Days');
    for (let i = 0; i < trip.days.length; i++) {
        let day = trip.days[i];
        //Subheading for day
        const date = DateTime.fromISO(day.date); 
        const formattedDate = date.toLocaleString(dateFormat);
        doc.font(bold)
            .fontSize(subHeaderFontSize)
            .text('Day ' + i + ' - ' + formattedDate);

        //Location
        doc.font(bold)
            .fontSize(textFontSize)
            .text('Location: ' + day.location);

        //Description
        doc.font(bold)
            .fontSize(textFontSize)
            .text('Description');
        doc.font(normal)
            .fontSize(textFontSize)
            .text(day.details.replace(/\r\n|\r/g, '\n'));
        doc.text('\n');
    }

    doc.end();
}

module.exports = { generatePDF };