import { NextResponse } from 'next/server';

// สำหรับเก็บข้อมูลการตั้งค่าชั่วคราว (หรือสามารถเปลี่ยนไปเชื่อมต่อกับ Database / Prisma ได้ตามต้องการ)
let systemSettings = {
  promptPayNumber: "0812345678", // ใส่เบอร์พร้อมเพย์เริ่มต้นของคุณ
  enabledMethods: {
    cash: true,
    promptpay: true,
    credit: true,
    soundEnabled: true,
    autoPrint: true,
  }
};

// GET: ดึงข้อมูลการตั้งค่า
export async function GET() {
  try {
    return NextResponse.json(systemSettings);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT: บันทึกการตั้งค่า
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // อัปเดตข้อมูลการตั้งค่า
    systemSettings = {
      ...systemSettings,
      ...body,
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully',
      data: systemSettings 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update settings' }, { status: 500 });
  }
}