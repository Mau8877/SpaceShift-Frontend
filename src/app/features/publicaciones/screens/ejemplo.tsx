'use client';

import { useState } from 'react';
import { ChevronRight, Upload, Home, MapPin, FileText, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const STEPS = [
    { id: 1, label: 'Datos del Inmueble', icon: Home },
    { id: 2, label: 'Ubicación', icon: MapPin },
    { id: 3, label: 'Publicación', icon: FileText },
    { id: 4, label: 'Imágenes', icon: ImageIcon },
];

interface PropertyData {
    // Inmueble
    tipoInmueble: string;
    areTerreno: string;
    areConstruida: string;
    habitaciones: string;
    banos: string;
    garajes: string;
    antiguedad: string;
    // Ubicación
    ciudad: string;
    zona: string;
    barrio: string;
    direccion: string;
    latitud: string;
    longitud: string;
    // Publicación
    titulo: string;
    descripcion: string;
    precio: string;
    tipoTransaccion: string;
    // Imágenes
    imagenes: File[];
}

export function PropertyPublicationModal() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<PropertyData>({
        tipoInmueble: '',
        areTerreno: '',
        areConstruida: '',
        habitaciones: '',
        banos: '',
        garajes: '',
        antiguedad: '',
        ciudad: '',
        zona: '',
        barrio: '',
        direccion: '',
        latitud: '',
        longitud: '',
        titulo: '',
        descripcion: '',
        precio: '',
        tipoTransaccion: '',
        imagenes: [],
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const newFiles = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            imagenes: [...prev.imagenes, ...newFiles],
        }));

        // Crear previsualizaciones
        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            imagenes: prev.imagenes.filter((_, i) => i !== index),
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleNextStep = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = () => {
        console.log('Datos del formulario:', formData);
        // Aquí se enviarían los datos al servidor
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl bg-background border border-border shadow-lg">
                {/* Header */}
                <div className="border-b border-border px-8 py-6">
                    <h1 className="text-2xl font-semibold text-foreground">Publicar Inmueble</h1>
                    <p className="text-muted-foreground text-sm mt-1">Completa todos los pasos para publicar tu propiedad</p>
                </div>

                {/* Stepper */}
                <div className="px-8 py-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isCompleted = currentStep > step.id;
                            const isActive = currentStep === step.id;

                            return (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${isCompleted
                                                    ? 'bg-primary text-primary-foreground'
                                                    : isActive
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                        </div>
                                        <span
                                            className={`text-xs mt-2 text-center font-medium max-w-[80px] ${isActive ? 'text-foreground' : 'text-muted-foreground'
                                                }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>

                                    {index < STEPS.length - 1 && (
                                        <div
                                            className={`h-1 flex-1 mx-2 rounded transition-colors ${isCompleted ? 'bg-primary' : 'bg-muted'
                                                }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <div className="px-8 py-6 min-h-96">
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground mb-6">Información del Inmueble</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Tipo de Inmueble</label>
                                    <select
                                        name="tipoInmueble"
                                        value={formData.tipoInmueble}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Seleccionar tipo</option>
                                        <option value="apartamento">Apartamento</option>
                                        <option value="casa">Casa</option>
                                        <option value="terreno">Terreno</option>
                                        <option value="local">Local Comercial</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Área de Terreno (m²)</label>
                                    <Input
                                        type="number"
                                        name="areTerreno"
                                        value={formData.areTerreno}
                                        onChange={handleInputChange}
                                        placeholder="Ej: 120"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Área Construida (m²)</label>
                                    <Input
                                        type="number"
                                        name="areConstruida"
                                        value={formData.areConstruida}
                                        onChange={handleInputChange}
                                        placeholder="Ej: 85"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Habitaciones</label>
                                    <Input
                                        type="number"
                                        name="habitaciones"
                                        value={formData.habitaciones}
                                        onChange={handleInputChange}
                                        placeholder="Ej: 3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Baños</label>
                                    <Input
                                        type="number"
                                        name="banos"
                                        value={formData.banos}
                                        onChange={handleInputChange}
                                        placeholder="Ej: 2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Garajes</label>
                                    <Input
                                        type="number"
                                        name="garajes"
                                        value={formData.garajes}
                                        onChange={handleInputChange}
                                        placeholder="Ej: 1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Antigüedad (años)</label>
                                    <Input
                                        type="number"
                                        name="antiguedad"
                                        value={formData.antiguedad}
                                        onChange={handleInputChange}
                                        placeholder="Ej: 5"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground mb-6">Ubicación del Inmueble</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Ciudad</label>
                                    <Input
                                        type="text"
                                        name="ciudad"
                                        value={formData.ciudad}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Bogotá"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Zona</label>
                                    <Input
                                        type="text"
                                        name="zona"
                                        value={formData.zona}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Norte"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Barrio</label>
                                    <Input
                                        type="text"
                                        name="barrio"
                                        value={formData.barrio}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Chapinero"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Dirección Exacta</label>
                                    <Input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Carrera 7 # 120-45"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Latitud</label>
                                    <Input
                                        type="number"
                                        step="0.0001"
                                        name="latitud"
                                        value={formData.latitud}
                                        onChange={handleInputChange}
                                        placeholder="Ej: 4.7110"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Longitud</label>
                                    <Input
                                        type="number"
                                        step="0.0001"
                                        name="longitud"
                                        value={formData.longitud}
                                        onChange={handleInputChange}
                                        placeholder="Ej: -74.0721"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground mb-6">Detalles de la Publicación</h2>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Título de la Publicación</label>
                                <Input
                                    type="text"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Hermoso apartamento en Chapinero"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Descripción General</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    placeholder="Describe la propiedad, características especiales, servicios..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Precio</label>
                                    <Input
                                        type="number"
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleInputChange}
                                        placeholder="Ej: 350000000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Tipo de Transacción</label>
                                    <select
                                        name="tipoTransaccion"
                                        value={formData.tipoTransaccion}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Seleccionar tipo</option>
                                        <option value="venta">Venta</option>
                                        <option value="arriendo">Arriendo</option>
                                        <option value="venta-arriendo">Venta/Arriendo</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground mb-6">Imágenes del Inmueble</h2>

                            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8 text-primary" />
                                    <p className="font-medium text-foreground">Sube tus imágenes aquí</p>
                                    <p className="text-xs text-muted-foreground">o haz clic para seleccionar archivos</p>
                                    <p className="text-xs text-muted-foreground mt-2">Máximo 10 imágenes, formato JPG o PNG</p>
                                </label>
                            </div>

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-4 gap-4 mt-6">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-md border border-border"
                                            />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute inset-0 bg-black/50 rounded-md opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                            >
                                                <span className="text-white text-sm font-medium">Eliminar</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-xs text-muted-foreground mt-4">
                                Imágenes cargadas: {formData.imagenes.length}/10
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-border px-8 py-4 flex items-center justify-between bg-muted/30">
                    <Button
                        onClick={handlePrevStep}
                        disabled={currentStep === 1}
                        variant="outline"
                        className="gap-2"
                    >
                        Anterior
                    </Button>

                    <span className="text-sm text-muted-foreground">
                        Paso {currentStep} de {STEPS.length}
                    </span>

                    {currentStep === STEPS.length ? (
                        <Button onClick={handleSubmit} className="gap-2 bg-primary hover:bg-primary/90">
                            <Check className="w-4 h-4" />
                            Publicar
                        </Button>
                    ) : (
                        <Button onClick={handleNextStep} className="gap-2 bg-primary hover:bg-primary/90">
                            Siguiente
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}
