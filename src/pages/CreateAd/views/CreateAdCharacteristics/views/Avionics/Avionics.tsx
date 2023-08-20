import React, { useEffect, useState } from 'react'
import Accordion from 'src/components/Accordion/Accordion'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import { Ad, AircraftAvionicsFormInput, Choices } from 'src/generated/graphql'
import { IValues } from '../../types'

interface IAvionics {
  currentAd: Ad
  choices: Choices
  values: IValues
  onChange: (values: AircraftAvionicsFormInput) => void
  onInitialValues: (values: IValues | ((prev: IValues) => IValues)) => void
}

const Avionics: React.FC<IAvionics> = React.memo(props => {
  const { currentAd, choices, values, onChange, onInitialValues } = props
  const [isLoading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (choices) {
      setLoading(false)
    }
  }, [choices])

  useEffect(() => {
    onChange({
      fmsN: values.fmsN,
      fms: values.fms,
      engMonitor: values.engMonitor,
      gpsN: values.gpsN,
      gpsModel1: values.gpsModel1,
      gpsModel2: values.gpsModel2,
      autopilot: values.autopilot,
      autopilotN: values.autopilotN,
      wxRadar: values.wxRadar,
      transponderN: values.transponderN,
      transponder1: values.transponder1,
      transponder2: values.transponder2,
      vhfComN: values.vhfComN,
      vhfComModel1: values.vhfComModel1,
      vhfComModel2: values.vhfComModel2,
      vhfNavN: values.vhfNavN,
      vhfNavModel1: values.vhfNavModel1,
      vhfNavModel2: values.vhfNavModel2,
    })
  }, [values])

  useEffect(() => {
    if (currentAd?.avionics) {
      const {
        fmsN,
        fms,
        engMonitor,
        gpsN,
        gpsModel1,
        gpsModel2,
        autopilot,
        autopilotN,
        wxRadar,
        transponderN,
        transponder1,
        transponder2,
        vhfComN,
        vhfComModel1,
        vhfComModel2,
        vhfNavN,
        vhfNavModel1,
        vhfNavModel2,
      } = currentAd?.avionics
      onInitialValues(prev => ({
        ...prev,
        fmsN: fmsN ? fmsN.value.toString() : '',
        fms: fms ? fms.value.toString() : '',
        engMonitor: engMonitor ? engMonitor.value.toString() : '',
        gpsN: gpsN ? gpsN.value.toString() : '',
        gpsModel1: gpsModel1 ? gpsModel1.value.toString() : '',
        gpsModel2: gpsModel2 ? gpsModel2.value.toString() : '',
        autopilot: autopilot ? autopilot.value.toString() : '',
        autopilotN: autopilotN ? autopilotN.value.toString() : '',
        wxRadar: wxRadar ? wxRadar.value.toString() : '',
        transponderN: transponderN ? transponderN.value.toString() : '',
        transponder1: transponder1 ? transponder1.value.toString() : '',
        transponder2: transponder2 ? transponder2.value.toString() : '',
        vhfComN: vhfComN ? vhfComN.value.toString() : '',
        vhfComModel1: vhfComModel1 ? vhfComModel1.value.toString() : '',
        vhfComModel2: vhfComModel2 ? vhfComModel2.value.toString() : '',
        vhfNavN: vhfNavN ? vhfNavN.value.toString() : '',
        vhfNavModel1: vhfNavModel1 ? vhfNavModel1.value.toString() : '',
        vhfNavModel2: vhfNavModel2 ? vhfNavModel2.value.toString() : '',
      }))
    }
  }, [currentAd])

  return (
    <Accordion>
      <div className="accordion__header">
        <div className="accordion__title">Avionics</div>
        <div className="accordion__arrow"></div>
      </div>
      <div className="accordion__body">
        <div className="accordion__items" title="Flight Management System">
          <div className="accordion__item">
            <FormikSelect
              className="select select-white"
              name="fmsN"
              options={choices?.fmsN}
              label="FMS #"
              placeholder="Select FMS #"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Flight Management System">
            <FormikSelect
              className="select select-white"
              name="fms"
              options={choices?.fms}
              label="FMS"
              placeholder="Select FMS"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Engine Monitor">
            <FormikSelect
              className="select select-white"
              name="engMonitor"
              options={choices?.engMonitor}
              label="Eng Monitor"
              placeholder="Select Eng Monitor"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Global Positioning System">
            <FormikSelect
              className="select select-white"
              name="gpsN"
              options={choices?.gpsN}
              label="GPS #"
              placeholder="Select GPS #"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Global Positioning System Model">
            <FormikSelect
              className="select select-white"
              name="gpsModel1"
              options={choices?.gpsModel1}
              label="GPS Model"
              placeholder="Select GPS Model"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Global Positioning System Model">
            <FormikSelect
              className="select select-white"
              name="gpsModel2"
              options={choices?.gpsModel2}
              label="GPS Model #2"
              placeholder="Select GPS Model #2"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Autopilot">
            <FormikSelect
              className="select select-white"
              name="autopilotN"
              options={choices?.autopilotN}
              label="Autopilot #"
              placeholder="Select Autopilot #"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Autopilot">
            <FormikSelect
              className="select select-white"
              name="autopilot"
              options={choices?.autopilot}
              label="Autopilot"
              placeholder="Select Autopilot"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Weather Radar">
            <FormikSelect
              className="select select-white"
              name="wxRadar"
              options={choices?.wxRadar}
              label="WX Radar"
              placeholder="Select WX Radar"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Transponder">
            <FormikSelect
              className="select select-white"
              name="transponderN"
              options={choices?.transponderN}
              label="Transponder #"
              placeholder="Select Transponder #"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Transponder">
            <FormikSelect
              className="select select-white"
              name="transponder1"
              options={choices?.transponder1}
              label="Transponder"
              placeholder="Select Transponder"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Transponder">
            <FormikSelect
              className="select select-white"
              name="transponder2"
              options={choices?.transponder2}
              label="Transponder #2"
              placeholder="Select Transponder #2"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Very High Frequency Communication System">
            <FormikSelect
              className="select select-white"
              name="vhfComN"
              options={choices?.vhfComN}
              label="VHF Com #"
              placeholder="Select VHF Com #"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Very High Frequency Communication System Model">
            <FormikSelect
              className="select select-white"
              name="vhfComModel1"
              options={choices?.vhfComModel1}
              label="VHF Com Model"
              placeholder="Select VHF Com Model"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Very High Frequency Communication System Model">
            <FormikSelect
              className="select select-white"
              name="vhfComModel2"
              options={choices?.vhfComModel2}
              label="VHF Com Model #2"
              placeholder="Select VHF Com Model #2"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Very High Frequency Navigation System">
            <FormikSelect
              className="select select-white"
              name="vhfNavN"
              options={choices?.vhfNavN}
              label="VHF Nav #"
              placeholder="Select VHF Nav #"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Very High Frequency Navigation System Model">
            <FormikSelect
              className="select select-white"
              name="vhfNavModel1"
              options={choices?.vhfNavModel1}
              label="VHF Nav Model"
              placeholder="Select VHF Nav Model"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Very High Frequency Navigation System Model">
            <FormikSelect
              className="select select-white"
              name="vhfNavModel2"
              options={choices?.vhfNavModel2}
              label="VHF Nav Model #2"
              placeholder="Select VHF Nav Model #2"
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </Accordion>
  )
})

export default Avionics
